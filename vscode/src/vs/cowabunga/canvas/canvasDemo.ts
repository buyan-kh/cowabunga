/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Cowabunga IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CanvasEngine, CanvasItem } from "./canvasEngine.js";
import { FileItemRenderer, FileCanvasItem } from "./fileItemRenderer.js";
import { URI } from "../../base/common/uri.js";
import { Disposable } from "../../base/common/lifecycle.js";

/**
 * Demo component that shows files on an infinite canvas
 * This is a working prototype of the Cowabunga spatial code organization
 */
export class CanvasDemo extends Disposable {
	private canvasEngine: CanvasEngine;
	private fileRenderer: FileItemRenderer;
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		super();

		this.container = container;

		// Create canvas element
		const canvas = document.createElement("canvas");
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.cursor = "grab";
		canvas.style.backgroundColor = "#1e1e1e"; // Dark theme

		container.appendChild(canvas);

		// Initialize canvas engine
		this.canvasEngine = new CanvasEngine(canvas);

		// Initialize file renderer
		this.fileRenderer = new FileItemRenderer(
			canvas.getContext("2d")!,
			this.canvasEngine.getViewport().scale
		);

		// Set up event handlers
		this.setupEventHandlers();

		// Create demo files
		this.createDemoFiles();
	}

	/**
	 * Set up event handlers for canvas interactions
	 */
	private setupEventHandlers(): void {
		// Update renderer scale when viewport changes
		this._register(
			this.canvasEngine.onViewportChanged((viewport: any) => {
				this.fileRenderer = new FileItemRenderer(
					this.canvasEngine["ctx"], // Access private ctx
					viewport.scale
				);
			})
		);

		// Handle item clicks
		this._register(
			this.canvasEngine.onItemClicked((item: CanvasItem) => {
				console.log("File clicked:", item);
				if (item.type === "file") {
					this.onFileClick(item as FileCanvasItem);
				}
			})
		);

		// Handle item double-clicks
		this._register(
			this.canvasEngine.onItemDoubleClicked((item: CanvasItem) => {
				console.log("File double-clicked:", item);
				if (item.type === "file") {
					this.onFileDoubleClick(item as FileCanvasItem);
				}
			})
		);
	}

	/**
	 * Create demo files to show on the canvas
	 */
	private createDemoFiles(): void {
		const demoFiles = [
			{
				name: "main.ts",
				language: "typescript",
				preview: `import { App } from './app.js';\nimport { Config } from './config.js';\n\nconst app = new App();\napp.start();`,
				x: 100,
				y: 100,
			},
			{
				name: "app.js",
				language: "javascript",
				preview: `class App {\n  constructor() {\n    this.initialized = false;\n  }\n\n  start() {\n    console.log('Starting app...');\n  }\n}`,
				x: 320,
				y: 100,
			},
			{
				name: "server.py",
				language: "python",
				preview: `from flask import Flask, request\nfrom database import connect\n\napp = Flask(__name__)\ndb = connect()\n\n@app.route('/api/users')\ndef get_users():`,
				x: 540,
				y: 100,
			},
			{
				name: "config.json",
				language: "json",
				preview: `{\n  "name": "cowabunga-demo",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.18.0"\n  }\n}`,
				x: 100,
				y: 280,
			},
			{
				name: "README.md",
				language: "markdown",
				preview: `# Cowabunga IDE Demo\n\nThis is a revolutionary IDE that uses\nspatial organization for code.\n\n## Features\n- Infinite canvas`,
				x: 320,
				y: 280,
			},
			{
				name: "styles.css",
				language: "css",
				preview: `.canvas-container {\n  width: 100%;\n  height: 100vh;\n  overflow: hidden;\n}\n\n.file-card {\n  border-radius: 8px;`,
				x: 540,
				y: 280,
			},
			{
				name: "database.go",
				language: "go",
				preview: `package main\n\nimport (\n    "database/sql"\n    _ "github.com/lib/pq"\n)\n\ntype DB struct {\n    conn *sql.DB\n}`,
				x: 760,
				y: 100,
			},
			{
				name: "utils.rs",
				language: "rust",
				preview: `use std::collections::HashMap;\nuse serde::{Deserialize, Serialize};\n\n#[derive(Debug, Serialize, Deserialize)]\npub struct FileItem {\n    pub name: String,`,
				x: 760,
				y: 280,
			},
		];

		demoFiles.forEach((fileData) => {
			const uri = URI.file(`/demo/${fileData.name}`);
			const fileItem = FileItemRenderer.createFileItem(
				uri,
				fileData.x,
				fileData.y
			);

			// Add demo-specific data
			fileItem.data.language = fileData.language;
			fileItem.data.preview = fileData.preview;
			fileItem.data.size = fileData.preview.length * 8; // Rough estimate
			fileItem.data.lastModified = new Date(
				Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7
			); // Random within last week
			fileItem.data.isOpen = Math.random() > 0.7; // 30% chance of being open
			fileItem.data.hasUnsavedChanges =
				fileItem.data.isOpen && Math.random() > 0.8; // 20% of open files have changes

			this.canvasEngine.addItem(fileItem);
		});

		// Override the render method to use our custom file renderer
		this.overrideCanvasRender();

		// Initial render
		this.canvasEngine.render();

		// Auto-fit to show all files
		setTimeout(() => {
			this.canvasEngine.fitToItems();
		}, 100);
	}

	/**
	 * Override the canvas render method to use our file renderer
	 */
	private overrideCanvasRender(): void {
		const originalRender = this.canvasEngine.render.bind(this.canvasEngine);

		this.canvasEngine.render = () => {
			// Call original render for grid and basic setup
			const ctx = this.canvasEngine["ctx"];
			const viewport = this.canvasEngine.getViewport();

			// Clear canvas
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			// Save context state
			ctx.save();

			// Apply viewport transformation
			ctx.translate(viewport.offsetX, viewport.offsetY);
			ctx.scale(viewport.scale, viewport.scale);

			// Render grid (copied from original)
			this.renderGrid(ctx, viewport);

			// Render all items using our custom renderer
			for (const item of this.canvasEngine.getItems()) {
				if (item.type === "file") {
					this.fileRenderer.renderFileItem(item as FileCanvasItem);
				} else {
					// Fall back to original rendering for other types
					this.renderBasicItem(ctx, item, viewport);
				}
			}

			// Restore context state
			ctx.restore();
		};
	}

	/**
	 * Render grid background (copied from CanvasEngine)
	 */
	private renderGrid(ctx: CanvasRenderingContext2D, viewport: any): void {
		const gridSize = 50;
		const lineWidth = 1 / viewport.scale;

		ctx.strokeStyle = "#2d2d30"; // Darker grid for dark theme
		ctx.lineWidth = lineWidth;
		ctx.globalAlpha = 0.3;

		// Calculate visible area
		const startX =
			Math.floor(-viewport.offsetX / viewport.scale / gridSize) * gridSize;
		const endX = startX + ctx.canvas.width / viewport.scale + gridSize;
		const startY =
			Math.floor(-viewport.offsetY / viewport.scale / gridSize) * gridSize;
		const endY = startY + ctx.canvas.height / viewport.scale + gridSize;

		// Draw vertical lines
		for (let x = startX; x <= endX; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, endY);
			ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = startY; y <= endY; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
			ctx.stroke();
		}

		ctx.globalAlpha = 1.0;
	}

	/**
	 * Render basic item (fallback for non-file items)
	 */
	private renderBasicItem(
		ctx: CanvasRenderingContext2D,
		item: CanvasItem,
		viewport: any
	): void {
		ctx.save();

		ctx.fillStyle = "#6c6c6c";
		ctx.strokeStyle = "#5a5a5a";
		ctx.lineWidth = 2 / viewport.scale;

		ctx.fillRect(item.x, item.y, item.width, item.height);
		ctx.strokeRect(item.x, item.y, item.width, item.height);

		ctx.restore();
	}

	/**
	 * Handle file click events
	 */
	private onFileClick(file: FileCanvasItem): void {
		console.log(`Clicked on file: ${file.data.name}`);

		// Focus on the clicked file
		this.canvasEngine.focusOnItem(file.id);

		// Show file info in console (later this could open a side panel)
		console.log("File details:", {
			name: file.data.name,
			size: file.data.size,
			language: file.data.language,
			isOpen: file.data.isOpen,
			hasChanges: file.data.hasUnsavedChanges,
		});
	}

	/**
	 * Handle file double-click events
	 */
	private onFileDoubleClick(file: FileCanvasItem): void {
		console.log(`Opening file: ${file.data.name}`);

		// Mark file as open
		file.data.isOpen = true;

		// Trigger re-render
		this.canvasEngine.render();

		// In a real implementation, this would:
		// 1. Open the file in VSCode editor
		// 2. Switch to the editor tab
		// 3. Update the file's open status
		// 4. Sync with workspace state
	}

	/**
	 * Add a new file to the canvas
	 */
	public addFile(uri: URI, x?: number, y?: number): void {
		const randomX = x ?? Math.random() * 800 + 100;
		const randomY = y ?? Math.random() * 400 + 100;

		const fileItem = FileItemRenderer.createFileItem(uri, randomX, randomY);

		// Set some demo data
		fileItem.data.size = Math.floor(Math.random() * 50000) + 1000;
		fileItem.data.lastModified = new Date();

		this.canvasEngine.addItem(fileItem);
	}

	/**
	 * Clear all files from the canvas
	 */
	public clearCanvas(): void {
		this.canvasEngine.clearItems();
	}

	/**
	 * Fit all files in view
	 */
	public fitToView(): void {
		this.canvasEngine.fitToItems();
	}

	/**
	 * Get the canvas engine for external access
	 */
	public getCanvasEngine(): CanvasEngine {
		return this.canvasEngine;
	}
}
