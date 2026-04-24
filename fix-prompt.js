const fs = require('fs');

let content = fs.readFileSync('components/AthleteHealthProfile.tsx', 'utf8');

// The new prompt
const newPrompt = `      const prompt = \`
        Você é um especialista em medicina esportiva e fisiologia do exercício de elite.
        Analise os seguintes dados de uma avaliação \${type} do atleta \${athlete.name}.
        
        DADOS DA AVALIAÇÃO:
        - Tipo: \${type}
        - Score: \${score}/100
        - Detalhes: \${JSON.stringify(data)}
        
        PERFIL DO ATLETA:
        - Nome: \${athlete.name}
        - Modalidade: \${athlete.modalidade}
        - Posição: \${athlete.posicao}
        - Categoria: \${athlete.category}
        - Nível de Risco Atual: \${athlete.risk_level}
        
        TAREFA:
        1. Gere um RELATÓRIO CLÍNICO DIRETO E OBJETIVO (em \${language === "en" ? "Inglês" : "Português"}), com linguagem profissional e prática. Seja direto ao ponto, não escreva como um artigo científico nem use introduções genéricas. Traga conclusões práticas para o dia a dia.
        2. Realize um CRUZAMENTO DE DADOS entre os resultados atuais e as demandas da posição e modalidade do atleta.
        3. Identifique alertas clínicos específicos (mínimo 1, máximo 5).
        
        FORMATO DE RESPOSTA (JSON):
        {
          "report": "Texto formatado em Markdown, com tópicos diretos.",
          "alerts": [
            { "type": "warning" | "danger" | "info", "message": "Descrição do alerta (no mesmo idioma do relatório)", "priority": "high" | "medium" | "low" }
          ]
        }
      \`;`;

// Regex to replace the old prompt block
content = content.replace(/const prompt = `[\s\S]*?(?=\`;\n\n      const response = await ai.models.generateContent)/, newPrompt.replace('`;', ''));

fs.writeFileSync('components/AthleteHealthProfile.tsx', content);
console.log('done');
