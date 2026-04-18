import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { searchParams } = new URL(request.url);
  const athleteId = searchParams.get('athleteId');

  const results: any = {};

  try {
    // 1. Check sleep_assessments
    const { data: sleepData, error: sleepError } = await supabase
      .from('sleep_assessments')
      .select('id, athlete_id, score, classification, assessment_date')
      .order('created_at', { ascending: false })
      .limit(5);
    
    results.sleep_assessments = { data: sleepData, error: sleepError };

    // 2. Check all_assessments view
    const { data: allData, error: allError } = await supabase
      .from('all_assessments')
      .select('id, athlete_id, assessment_type, score, classification, source_table, assessment_date')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('Debug: Error fetching from all_assessments view:', {
        message: allError.message,
        details: allError.details,
        hint: allError.hint,
        code: allError.code
      });
    }

    results.all_assessments = { 
      data: allData, 
      error: allError ? {
        message: allError.message,
        details: allError.details,
        hint: allError.hint,
        code: allError.code
      } : null 
    };

    // 3. Check clinical_assessments
    const { data: clinicalData, error: clinicalError } = await supabase
      .from('clinical_assessments')
      .select('id, athlete_id, type, score, risk_level, assessment_date')
      .order('created_at', { ascending: false })
      .limit(5);

    results.clinical_assessments = { data: clinicalData, error: clinicalError };

    // 4. Try to insert a test assessment
    if (athleteId) {
      const { data: insertData, error: insertError } = await supabase
        .from('sleep_assessments')
        .insert([
          {
            athlete_id: athleteId,
            score: 99,
            classification: 'Teste',
            classification_color: 'blue-500',
            alerts: ['Teste de alerta'],
            raw_data: { test: true },
            assessment_date: new Date().toISOString()
          }
        ])
        .select();
      
      results.test_insert = { data: insertData, error: insertError };

      if (insertData && insertData.length > 0) {
        // 5. Check if it appears in all_assessments
        const { data: checkAllData, error: checkAllError } = await supabase
          .from('all_assessments')
          .select('id, athlete_id, assessment_type, source_table')
          .eq('id', insertData[0].id);
        
        results.test_check_all = { data: checkAllData, error: checkAllError };
      }
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
