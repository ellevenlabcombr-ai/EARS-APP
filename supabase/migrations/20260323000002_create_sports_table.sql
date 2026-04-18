-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    positions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to sports" ON sports
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert sports" ON sports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update sports" ON sports
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete sports" ON sports
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert initial sports
INSERT INTO sports (name, positions) VALUES
('Atletismo', ARRAY['Velocidade', 'Fundo', 'Saltos', 'Arremessos', 'Marcha']),
('Basquete', ARRAY['Armador', 'Ala-Armador', 'Ala', 'Ala-Pivô', 'Pivô']),
('Futsal', ARRAY['Goleiro', 'Fixo', 'Ala Direito', 'Ala Esquerdo', 'Pivô']),
('Futebol de Campo', ARRAY['Goleiro', 'Lateral Direito', 'Lateral Esquerdo', 'Zagueiro', 'Volante', 'Meia', 'Atacante', 'Centroavante']),
('Handebol', ARRAY['Goleiro', 'Ponta Esquerda', 'Ponta Direita', 'Armador Esquerdo', 'Armador Central', 'Armador Direito', 'Pivô']),
('Judô', ARRAY['Ligeiro', 'Meio-Leve', 'Leve', 'Meio-Médio', 'Médio', 'Meio-Pesado', 'Pesado']),
('Natação', ARRAY['Crawl', 'Costas', 'Peito', 'Borboleta', 'Medley']),
('Tênis', ARRAY['Simples', 'Duplas']),
('Volleyball', ARRAY['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Líbero']),
('Vôlei de Praia', ARRAY['Defesa', 'Bloqueio'])
ON CONFLICT (name) DO NOTHING;
