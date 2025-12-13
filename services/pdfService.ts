import { jsPDF } from 'jspdf';
import { HistoryRecord, Tool } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { AlignCenterHorizontal } from 'lucide-react';
import logoSrc from '../assets/logo.png';

// Helper para carregar a imagem como Base64
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error("Canvas context not available"));
      }
    };
    img.onerror = (error) => reject(error);
  });
};

export const generateCheckoutPDF = async (
  record: Omit<HistoryRecord, 'id'>,
  tools: Tool[]
) => {
  const doc = new jsPDF();
  const margin = 10;
  let yPos = margin;
  const isReturn = record.actionType === 'RETURN';
  const title = isReturn ? "COMPROVANTE DE DEVOLUÇÃO" : "COMPROVANTE DE RETIRADA";
  const headerColor = isReturn ? [22, 163, 74] : [14, 130, 165]; // Green for return, Blue for checkout

  // Header Background
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Logo & Title Logic
  try {
    // Tenta carregar o logo
    const logoBase64 = await getBase64ImageFromURL(logoSrc);
    // Adiciona o logo: X=margin, Y=10, W=18, H=18
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 25; // largura da imagem
    const x = (pageWidth - imgWidth) / 2; // centraliza
    doc.addImage(logoBase64, 'PNG', x, 3, imgWidth, 30);

    // Texto ZAGFER deslocado para a direita
    doc.setTextColor(255, 255, 255);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 38, {
      align: "center"
    });
  } catch (error) {
    console.warn("Logo não encontrado ou erro ao carregar, gerando sem logo.", error);
    // Fallback: Layout sem logo se der erro
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("ZAGFER", margin, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, margin, 32);
  }

  yPos = 55;
  doc.setTextColor(0, 0, 0);

  // Info Section - Grid Layout
  doc.setFontSize(10);

  // Column 1: Transaction Info
  doc.setFont('helvetica', 'bold');
  doc.text("Detalhes da Operação:", margin, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(`Data: ${format(record.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}`, margin, yPos);
  yPos += 6;
  doc.text(`Tipo: ${isReturn ? 'Devolução' : 'Retirada'}`, margin, yPos);

  // Show Deadline if it exists and is a Checkout
  if (!isReturn && record.expectedReturnDate) {
    yPos += 6;
    doc.setTextColor(0, 0, 0); // Black
    doc.setFont('helvetica', 'normal');
    doc.text(`Previsão Devolução: ${format(record.expectedReturnDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}`, margin, yPos);
    doc.setFont('helvetica', 'normal');
  }

  // Column 2: People Info
  yPos = 55;
  const col2X = 110;
  doc.setFont('helvetica', 'bold');
  doc.text("Responsáveis:", col2X, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(`MILITAR: ${record.responsibleName}`, col2X, yPos);
  yPos += 6;
  doc.text(`OM/Seção: ${record.responsibleMatricula}`, col2X, yPos);
  yPos += 6;
  doc.text(`Despachante: ${record.dispatcherName}`, col2X, yPos);

  yPos += 20; // Increased spacing to accommodate extra line

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 6, 170, 8, 'F');
  doc.setFont('helvetica', 'bold');

  // Defined columns: Tool Name, BMP, Category, Sector
  doc.text("Ferramenta", margin + 2, yPos);
  doc.text("BMP", margin + 75, yPos);
  doc.text("Categoria", margin + 100, yPos);
  doc.text("Setor", margin + 135, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');

  // List Tools
  tools.forEach((tool) => {
    // Truncate tool name if too long to avoid overlapping BMP column
    const toolName = tool.name + (tool.size ? ` (${tool.size})` : '');
    const truncatedName = toolName.length > 35 ? toolName.substring(0, 32) + '...' : toolName;

    doc.text(truncatedName, margin + 2, yPos);
    doc.text(tool.bmp || '-', margin + 75, yPos);
    doc.text(tool.category, margin + 100, yPos);
    doc.text(tool.sector, margin + 135, yPos);
    yPos += 8;
  });


  if (!isReturn) {
    // CHECKOUT: Assinatura centralizada do militar
    doc.text("O militar declara ter recebido as ferramentas em perfeito estado e compromete-se a devolvê-las.", margin, yPos + 5);

    yPos += 30;
    doc.setDrawColor(0, 0, 0); // Black line
    doc.setTextColor(0, 0, 0); // Black text

    // Centering logic: Page width ~210mm. Center is 105mm.
    // Line width 100mm (Starts at 55, ends at 155)
    doc.line(55, yPos, 155, yPos);

    // "align: 'center'" centers the text at the X coordinate provided (105)
    doc.text(`${record.responsibleName}`, 105, yPos + 5, { align: 'center' });

  } else {
    // RETURN: Apenas frase de recebimento
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text(`Recebido pelo ${record.dispatcherName}`, margin, yPos + 10);
  }

  // Footer
  yPos += 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento gerado automaticamente pelo sistema ZAGFER.", margin, yPos);

  return doc;
};