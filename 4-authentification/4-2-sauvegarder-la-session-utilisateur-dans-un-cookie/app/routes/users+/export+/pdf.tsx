import PDFDocument from "pdfkit";
import { getUsers } from "~/server/users.server";
import type { Route } from "./+types/pdf";

export async function loader({}: Route.LoaderArgs) {
	const users = await getUsers();

	// Create a PDF document
	const doc = new PDFDocument();
	const chunks: Buffer[] = [];

	// Collect PDF data chunks
	doc.on("data", (chunk) => {
		chunks.push(chunk);
	});

	// Add content to the PDF
	doc.fontSize(16).text("Users List", { align: "center" });
	doc.moveDown();

	for (const user of users) {
		doc.fontSize(12).text(`${user.id}: ${user.firstName} ${user.lastName}`);
		doc.moveDown(0.5);
	}

	// Finalize the PDF
	doc.end();

	// Wait for PDF generation to complete before sending response
	return new Promise<Response>((resolve) => {
		doc.on("end", () => {
			// Convert chunks to a single buffer
			const pdfBuffer = Buffer.concat(chunks);
			const pdf = new Uint8Array(pdfBuffer);

			resolve(
				new Response(pdf, {
					headers: {
						"Content-Type": "application/pdf",
						"Content-Disposition": `attachment; filename="users.pdf"`,
					},
				}),
			);
		});
	});
}
