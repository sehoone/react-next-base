"use client";
import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
	"/libs/pdfjs-5.0.375-dist/build/pdf.worker.mjs";

export default function PdfParserPage() {
	const [parsedSections, setParsedSections] = useState<
		{ title: string; content: string }[]
	>([]);
	const [images, setImages] = useState<{ page: number; dataUrl: string }[]>([]);

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const arrayBuffer = await file.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

		let text = "";
		const extractedImages: { page: number; dataUrl: string }[] = [];

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const content = await page.getTextContent();

			// 줄바꿈 복원 로직
			let previousY = null;
			let pageText = "";
			content.items.forEach((item: any) => {
				const currentY = item.transform[5]; // Y 좌표
				if (previousY !== null && Math.abs(currentY - previousY) > 10) {
					pageText += "\n";
				}
				pageText += item.str;
				previousY = currentY;
			});

			text += pageText + "\n";

			// 이미지 추출
			const operatorList = await page.getOperatorList();
			const objs = page.commonObjs;
			for (let j = 0; j < operatorList.fnArray.length; j++) {
				if (
					operatorList.fnArray[j] === pdfjsLib.OPS.paintJpegXObject ||
					operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject
				) {
					const imageName = operatorList.argsArray[j][0];

					// 이미지 객체가 로드되었는지 확인
					if (objs.has(imageName)) {
						const image = objs.get(imageName);
						if (image) {
							const canvas = document.createElement("canvas");
							canvas.width = image.width;
							canvas.height = image.height;
							const ctx = canvas.getContext("2d");
							const imageData = new ImageData(
								new Uint8ClampedArray(image.data),
								image.width,
								image.height
							);
							ctx?.putImageData(imageData, 0, 0);
							const dataUrl = canvas.toDataURL("image/jpeg");
							extractedImages.push({ page: i, dataUrl });
						}
					} else {
						console.warn(`Image object ${imageName} is not resolved yet.`);
					}
				}
			}
		}

		const sections = parseTextBySections(text); // 텍스트를 섹션으로 분리
		console.log("Parsed sections:", sections);
		console.log("Extracted images:", extractedImages);
		setParsedSections(sections);
		setImages(extractedImages);
	};

	const parseTextBySections = (text: string) => {
		const lines = text.split("\n");
		const sections: { title: string; content: string }[] = [];
		let currentSection: { title: string; content: string } | null = null;

		lines.forEach((line) => {
			const sectionMatch = line.match(/^(\d+)\s{3}(.*)$/); // 숫자와 스페이스 3개로 시작하는 상위 섹션 매칭
			const subSectionMatch = line.match(/^(\d+\.\d+)\s+(.*)$/); // 숫자.숫자 형식의 하위 섹션 매칭

			if (sectionMatch) {
				const title = sectionMatch[1].trim(); // 상위 섹션 번호
				const content = sectionMatch[2].trim(); // 상위 섹션 제목

				if (currentSection) {
					sections.push(currentSection); // 이전 섹션 저장
				}
				currentSection = { title, content }; // 새로운 상위 섹션 시작
			} else if (subSectionMatch && currentSection) {
				const subTitle = subSectionMatch[1].trim(); // 하위 섹션 번호
				const subContent = subSectionMatch[2].trim(); // 하위 섹션 제목 및 내용

				currentSection.content += `\n${subTitle} ${subContent}`; // 하위 섹션 추가
			} else if (currentSection) {
				currentSection.content += `\n${line.trim()}`; // 현재 섹션에 내용 추가
			}
		});

		if (currentSection) {
			sections.push(currentSection); // 마지막 섹션 저장
		}

		return sections;
	};

	const handleDownloadAll = async () => {
		const response = await fetch("/font/NotoSansKR/NotoSansKR-Regular.ttf"); // public 디렉토리에서 폰트 파일 로드
		const fontBuffer = await response.arrayBuffer();
		const fontBase64 = Buffer.from(fontBuffer).toString("base64"); // Base64 변환

		for (const section of parsedSections) {
			const doc = new jsPDF();
			doc.addFileToVFS("NotoSansKR-Regular.ttf", fontBase64); // Base64로 변환된 폰트 추가
			doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
			doc.setFont("NotoSansKR"); // 한글 폰트 설정

			const lines = doc.splitTextToSize(section.content, 180); // 텍스트 줄바꿈
			doc.text(lines, 10, 10); // 텍스트 추가

			// 이미지 추가
			images.forEach((image) => {
				if (image.page === parseInt(section.title)) {
					doc.addPage();
					doc.addImage(image.dataUrl, "JPEG", 10, 10, 180, 160); // 이미지 추가
				}
			});

			doc.save(`${section.title || "Untitled"}.pdf`); // PDF 저장
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">PDF Parser</h1>
				<input
					type="file"
					accept=".pdf"
					onChange={handleFileUpload}
					className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
				/>
				<button
					onClick={handleDownloadAll}
					className="mt-4 inline-block bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow hover:bg-green-700"
				>
					Download All as PDFs
				</button>
				<div className="mt-6 space-y-6">
					{parsedSections.map((section, index) => (
						<div
							key={index}
							className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm"
						>
							<h2 className="text-lg font-semibold text-gray-700 mb-2">
								{section.title}
							</h2>
							<pre className="text-sm text-gray-600 whitespace-pre-wrap">
								{section.content}
							</pre>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
