#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Função para converter SVG para PNG usando canvas (com bun)
async function convertSvgToPng(svgPath: string, pngPath: string, size: number = 128) {
  const svgContent = readFileSync(svgPath, 'utf-8');
  
  // Usando sharp se disponível, senão vamos usar outro método
  try {
    const sharp = await import('sharp');
    await sharp.default(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✅ PNG criado: ${pngPath}`);
  } catch (error) {
    console.error('Sharp não disponível, tentando método alternativo...');
    
    // Método alternativo: usar @resvg/resvg-js
    try {
      const { Resvg } = await import('@resvg/resvg-js');
      const opts = {
        fitTo: {
          mode: 'width' as const,
          value: size,
        },
      };
      
      const resvg = new Resvg(svgContent, opts);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      
      writeFileSync(pngPath, pngBuffer);
      console.log(`✅ PNG criado: ${pngPath}`);
    } catch (resvgError) {
      console.error('Erro ao converter SVG:', resvgError);
      console.log('\nPor favor, instale uma das bibliotecas:');
      console.log('  bun add -d sharp');
      console.log('  ou');
      console.log('  bun add -d @resvg/resvg-js');
    }
  }
}

const svgPath = join(import.meta.dir, '../apps/mcp-vscode-extension/icon.svg');
const pngPath = join(import.meta.dir, '../apps/mcp-vscode-extension/icon.png');

convertSvgToPng(svgPath, pngPath, 128);
