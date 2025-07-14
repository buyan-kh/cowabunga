/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Cowabunga IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CanvasItem } from "./canvasEngine.js";
import { URI } from "../../base/common/uri.js";

/**
 * Represents a file displayed on the canvas
 */
export interface FileCanvasItem extends CanvasItem {
	type: "file";
	data: {
		uri: URI;
		name: string;
		extension: string;
		size: number;
		lastModified: Date;
		language?: string;
		preview?: string; // First few lines of code
		isDirectory: boolean;
		isOpen: boolean; // Is currently open in editor
		hasUnsavedChanges: boolean;
	};
}

/**
 * Visual themes for different file types
 */
export interface FileTheme {
	backgroundColor: string;
	borderColor: string;
	iconColor: string;
	textColor: string;
	accentColor: string;
}

/**
 * File type themes based on programming language/extension
 */
export const FILE_THEMES: { [key: string]: FileTheme } = {
	typescript: {
		backgroundColor: "#007acc",
		borderColor: "#005a9e",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#00a8ff",
	},
	javascript: {
		backgroundColor: "#f7df1e",
		borderColor: "#d4b830",
		iconColor: "#323330",
		textColor: "#323330",
		accentColor: "#f7df1e",
	},
	python: {
		backgroundColor: "#3776ab",
		borderColor: "#2d5d8f",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#ffde57",
	},
	rust: {
		backgroundColor: "#dea584",
		borderColor: "#ce956b",
		iconColor: "#000000",
		textColor: "#000000",
		accentColor: "#ce956b",
	},
	go: {
		backgroundColor: "#00add8",
		borderColor: "#0090b4",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#00add8",
	},
	json: {
		backgroundColor: "#666666",
		borderColor: "#4d4d4d",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#ffa500",
	},
	markdown: {
		backgroundColor: "#083fa1",
		borderColor: "#062d75",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#083fa1",
	},
	css: {
		backgroundColor: "#1572b6",
		borderColor: "#115a8a",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#1572b6",
	},
	html: {
		backgroundColor: "#e34f26",
		borderColor: "#c23616",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#e34f26",
	},
	default: {
		backgroundColor: "#6c6c6c",
		borderColor: "#5a5a5a",
		iconColor: "#ffffff",
		textColor: "#ffffff",
		accentColor: "#888888",
	},
};

/**
 * Renders file items on the canvas with enhanced visual representation
 */
export class FileItemRenderer {
	private ctx: CanvasRenderingContext2D;
	private scale: number;

	constructor(ctx: CanvasRenderingContext2D, scale: number) {
		this.ctx = ctx;
		this.scale = scale;
	}

	/**
	 * Render a file item with enhanced visual design
	 */
	public renderFileItem(item: FileCanvasItem): void {
		this.ctx.save();

		const theme = this.getFileTheme(item.data.extension, item.data.language);
		const scaledLineWidth = 2 / this.scale;

		// Draw main card with rounded corners
		this.drawRoundedRect(item.x, item.y, item.width, item.height, 8);
		this.ctx.fillStyle = theme.backgroundColor;
		this.ctx.fill();

		// Draw border
		this.ctx.strokeStyle = theme.borderColor;
		this.ctx.lineWidth = scaledLineWidth;
		this.ctx.stroke();

		// Add visual indicators
		this.renderFileIndicators(item, theme);

		// Render file icon
		this.renderFileIcon(item, theme);

		// Render file name
		this.renderFileName(item, theme);

		// Render file info (size, modified date)
		this.renderFileInfo(item, theme);

		// Render code preview if available
		if (item.data.preview) {
			this.renderCodePreview(item, theme);
		}

		this.ctx.restore();
	}

	/**
	 * Get theme for file based on extension or language
	 */
	private getFileTheme(extension: string, language?: string): FileTheme {
		const key = language || extension.toLowerCase().replace(".", "");
		return FILE_THEMES[key] || FILE_THEMES.default;
	}

	/**
	 * Draw rounded rectangle
	 */
	private drawRoundedRect(
		x: number,
		y: number,
		width: number,
		height: number,
		radius: number
	): void {
		const scaledRadius = radius / this.scale;

		this.ctx.beginPath();
		this.ctx.moveTo(x + scaledRadius, y);
		this.ctx.lineTo(x + width - scaledRadius, y);
		this.ctx.quadraticCurveTo(x + width, y, x + width, y + scaledRadius);
		this.ctx.lineTo(x + width, y + height - scaledRadius);
		this.ctx.quadraticCurveTo(
			x + width,
			y + height,
			x + width - scaledRadius,
			y + height
		);
		this.ctx.lineTo(x + scaledRadius, y + height);
		this.ctx.quadraticCurveTo(x, y + height, x, y + height - scaledRadius);
		this.ctx.lineTo(x, y + scaledRadius);
		this.ctx.quadraticCurveTo(x, y, x + scaledRadius, y);
		this.ctx.closePath();
	}

	/**
	 * Render visual indicators (open, modified, etc.)
	 */
	private renderFileIndicators(item: FileCanvasItem, theme: FileTheme): void {
		const indicatorSize = 6 / this.scale;
		const margin = 4 / this.scale;

		let indicatorX = item.x + item.width - margin - indicatorSize;
		const indicatorY = item.y + margin;

		// Unsaved changes indicator
		if (item.data.hasUnsavedChanges) {
			this.ctx.fillStyle = "#ff6b6b";
			this.ctx.beginPath();
			this.ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, 2 * Math.PI);
			this.ctx.fill();
			indicatorX -= indicatorSize + margin / 2;
		}

		// Open in editor indicator
		if (item.data.isOpen) {
			this.ctx.fillStyle = "#51cf66";
			this.ctx.beginPath();
			this.ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, 2 * Math.PI);
			this.ctx.fill();
		}
	}

	/**
	 * Render file type icon
	 */
	private renderFileIcon(item: FileCanvasItem, theme: FileTheme): void {
		const iconSize = 16 / this.scale;
		const margin = 8 / this.scale;
		const iconX = item.x + margin;
		const iconY = item.y + margin;

		this.ctx.fillStyle = theme.iconColor;
		this.ctx.font = `${iconSize}px "codicon"`;
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";

		// Get icon based on file type
		const icon = this.getFileIcon(item.data.extension, item.data.isDirectory);
		this.ctx.fillText(icon, iconX, iconY);
	}

	/**
	 * Get icon character for file type
	 */
	private getFileIcon(extension: string, isDirectory: boolean): string {
		if (isDirectory) return "📁";

		const iconMap: { [key: string]: string } = {
			".ts": "📘",
			".tsx": "⚛️",
			".js": "📜",
			".jsx": "⚛️",
			".py": "🐍",
			".rs": "🦀",
			".go": "🐹",
			".java": "☕",
			".cpp": "⚙️",
			".c": "⚙️",
			".css": "🎨",
			".html": "🌐",
			".json": "📋",
			".md": "📝",
			".yml": "⚙️",
			".yaml": "⚙️",
			".xml": "📄",
			".sql": "🗃️",
		};

		return iconMap[extension.toLowerCase()] || "📄";
	}

	/**
	 * Render file name
	 */
	private renderFileName(item: FileCanvasItem, theme: FileTheme): void {
		const margin = 8 / this.scale;
		const iconSize = 16 / this.scale;
		const fontSize = 12 / this.scale;

		this.ctx.fillStyle = theme.textColor;
		this.ctx.font = `bold ${fontSize}px Arial`;
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";

		const textX = item.x + margin * 2 + iconSize + margin;
		const textY = item.y + margin;

		// Truncate name if too long
		let displayName = item.data.name;
		const maxWidth = item.width - textX + item.x - margin;

		while (
			this.ctx.measureText(displayName).width > maxWidth &&
			displayName.length > 3
		) {
			displayName = displayName.substring(0, displayName.length - 4) + "...";
		}

		this.ctx.fillText(displayName, textX, textY);
	}

	/**
	 * Render file information (size, modified date)
	 */
	private renderFileInfo(item: FileCanvasItem, theme: FileTheme): void {
		const margin = 8 / this.scale;
		const fontSize = 9 / this.scale;

		this.ctx.fillStyle = theme.textColor;
		this.ctx.globalAlpha = 0.8;
		this.ctx.font = `${fontSize}px Arial`;
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "bottom";

		// Format file size
		const sizeText = this.formatFileSize(item.data.size);

		// Format last modified date
		const dateText = this.formatDate(item.data.lastModified);

		const infoText = `${sizeText} • ${dateText}`;
		const textX = item.x + margin;
		const textY = item.y + item.height - margin;

		this.ctx.fillText(infoText, textX, textY);
		this.ctx.globalAlpha = 1.0;
	}

	/**
	 * Render code preview
	 */
	private renderCodePreview(item: FileCanvasItem, theme: FileTheme): void {
		if (!item.data.preview) return;

		const margin = 8 / this.scale;
		const fontSize = 8 / this.scale;
		const lineHeight = fontSize * 1.2;
		const maxLines = 4;

		this.ctx.fillStyle = theme.textColor;
		this.ctx.globalAlpha = 0.6;
		this.ctx.font = `${fontSize}px "Consolas", "Monaco", monospace`;
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";

		const startY = item.y + margin * 4;
		const maxWidth = item.width - margin * 2;

		const lines = item.data.preview.split("\n").slice(0, maxLines);

		lines.forEach((line, index) => {
			if (line.trim() === "") return;

			// Truncate line if too long
			let displayLine = line.trim();
			while (
				this.ctx.measureText(displayLine).width > maxWidth &&
				displayLine.length > 3
			) {
				displayLine = displayLine.substring(0, displayLine.length - 4) + "...";
			}

			this.ctx.fillText(
				displayLine,
				item.x + margin,
				startY + index * lineHeight
			);
		});

		this.ctx.globalAlpha = 1.0;
	}

	/**
	 * Format file size for display
	 */
	private formatFileSize(bytes: number): string {
		if (bytes === 0) return "0 B";

		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	}

	/**
	 * Format date for display
	 */
	private formatDate(date: Date): string {
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}h ago`;
		} else if (diffInHours < 24 * 7) {
			return `${Math.floor(diffInHours / 24)}d ago`;
		} else {
			return date.toLocaleDateString();
		}
	}

	/**
	 * Create a file canvas item from file URI
	 */
	public static createFileItem(
		uri: URI,
		x: number,
		y: number,
		width: number = 180,
		height: number = 120
	): FileCanvasItem {
		const name = uri.path.split("/").pop() || "Unknown";
		const extension = name.includes(".") ? "." + name.split(".").pop() : "";

		return {
			id: uri.toString(),
			x,
			y,
			width,
			height,
			type: "file",
			data: {
				uri,
				name,
				extension,
				size: 0, // Will be populated when file is loaded
				lastModified: new Date(),
				isDirectory: false,
				isOpen: false,
				hasUnsavedChanges: false,
			},
		};
	}
}
