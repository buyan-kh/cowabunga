/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Cowabunga IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from "vs/base/common/lifecycle";
import { Event, Emitter } from "vs/base/common/event";

/**
 * Represents a point in 2D space
 */
export interface Point {
	x: number;
	y: number;
}

/**
 * Represents the viewport state of the canvas
 */
export interface ViewportState {
	scale: number; // Zoom level (1.0 = 100%)
	offsetX: number; // Pan offset X
	offsetY: number; // Pan offset Y
}

/**
 * Represents an item that can be rendered on the canvas
 */
export interface CanvasItem {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	type: "file" | "folder" | "connection" | "note";
	data?: any;
}

/**
 * Core canvas engine for the Cowabunga IDE infinite canvas
 * Handles rendering, zooming, panning, and item management
 */
export class CanvasEngine extends Disposable {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private viewport: ViewportState;
	private items: Map<string, CanvasItem>;
	private isDragging: boolean = false;
	private lastMousePos: Point = { x: 0, y: 0 };

	// Events
	private readonly _onViewportChanged = this._register(
		new Emitter<ViewportState>()
	);
	public readonly onViewportChanged: Event<ViewportState> =
		this._onViewportChanged.event;

	private readonly _onItemClicked = this._register(new Emitter<CanvasItem>());
	public readonly onItemClicked: Event<CanvasItem> = this._onItemClicked.event;

	private readonly _onItemDoubleClicked = this._register(
		new Emitter<CanvasItem>()
	);
	public readonly onItemDoubleClicked: Event<CanvasItem> =
		this._onItemDoubleClicked.event;

	constructor(canvas: HTMLCanvasElement) {
		super();

		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get 2D rendering context");
		}
		this.ctx = ctx;

		// Initialize viewport
		this.viewport = {
			scale: 1.0,
			offsetX: 0,
			offsetY: 0,
		};

		this.items = new Map();

		this.setupEventListeners();
		this.setupCanvasSize();
	}

	/**
	 * Set up event listeners for mouse interactions
	 */
	private setupEventListeners(): void {
		// Mouse wheel for zooming
		this._register(
			Event.fromDOMEventEmitter(
				this.canvas,
				"wheel"
			)((e: WheelEvent) => {
				e.preventDefault();
				this.handleZoom(e);
			})
		);

		// Mouse down for starting drag
		this._register(
			Event.fromDOMEventEmitter(
				this.canvas,
				"mousedown"
			)((e: MouseEvent) => {
				this.handleMouseDown(e);
			})
		);

		// Mouse move for dragging
		this._register(
			Event.fromDOMEventEmitter(
				this.canvas,
				"mousemove"
			)((e: MouseEvent) => {
				this.handleMouseMove(e);
			})
		);

		// Mouse up for ending drag
		this._register(
			Event.fromDOMEventEmitter(
				this.canvas,
				"mouseup"
			)((e: MouseEvent) => {
				this.handleMouseUp(e);
			})
		);

		// Double click for item interaction
		this._register(
			Event.fromDOMEventEmitter(
				this.canvas,
				"dblclick"
			)((e: MouseEvent) => {
				this.handleDoubleClick(e);
			})
		);

		// Window resize
		this._register(
			Event.fromDOMEventEmitter(
				window,
				"resize"
			)(() => {
				this.setupCanvasSize();
				this.render();
			})
		);
	}

	/**
	 * Set up canvas size to match container
	 */
	private setupCanvasSize(): void {
		const rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width * window.devicePixelRatio;
		this.canvas.height = rect.height * window.devicePixelRatio;
		this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		this.canvas.style.width = rect.width + "px";
		this.canvas.style.height = rect.height + "px";
	}

	/**
	 * Handle zoom with mouse wheel
	 */
	private handleZoom(e: WheelEvent): void {
		const zoomFactor = 1.1;
		const mouseX = e.offsetX;
		const mouseY = e.offsetY;

		// Convert mouse position to world coordinates
		const worldX = (mouseX - this.viewport.offsetX) / this.viewport.scale;
		const worldY = (mouseY - this.viewport.offsetY) / this.viewport.scale;

		// Update scale
		if (e.deltaY < 0) {
			this.viewport.scale *= zoomFactor; // Zoom in
		} else {
			this.viewport.scale /= zoomFactor; // Zoom out
		}

		// Clamp scale between reasonable limits
		this.viewport.scale = Math.max(0.1, Math.min(5.0, this.viewport.scale));

		// Adjust offset to keep mouse position fixed
		this.viewport.offsetX = mouseX - worldX * this.viewport.scale;
		this.viewport.offsetY = mouseY - worldY * this.viewport.scale;

		this._onViewportChanged.fire(this.viewport);
		this.render();
	}

	/**
	 * Handle mouse down events
	 */
	private handleMouseDown(e: MouseEvent): void {
		this.isDragging = true;
		this.lastMousePos = { x: e.offsetX, y: e.offsetY };
		this.canvas.style.cursor = "grabbing";
	}

	/**
	 * Handle mouse move events for panning
	 */
	private handleMouseMove(e: MouseEvent): void {
		if (!this.isDragging) return;

		const deltaX = e.offsetX - this.lastMousePos.x;
		const deltaY = e.offsetY - this.lastMousePos.y;

		this.viewport.offsetX += deltaX;
		this.viewport.offsetY += deltaY;

		this.lastMousePos = { x: e.offsetX, y: e.offsetY };

		this._onViewportChanged.fire(this.viewport);
		this.render();
	}

	/**
	 * Handle mouse up events
	 */
	private handleMouseUp(e: MouseEvent): void {
		if (this.isDragging) {
			this.isDragging = false;
			this.canvas.style.cursor = "grab";

			// Check if we clicked on an item
			const item = this.getItemAtPosition(e.offsetX, e.offsetY);
			if (item) {
				this._onItemClicked.fire(item);
			}
		}
	}

	/**
	 * Handle double click events
	 */
	private handleDoubleClick(e: MouseEvent): void {
		const item = this.getItemAtPosition(e.offsetX, e.offsetY);
		if (item) {
			this._onItemDoubleClicked.fire(item);
		}
	}

	/**
	 * Get canvas item at screen position
	 */
	private getItemAtPosition(
		screenX: number,
		screenY: number
	): CanvasItem | undefined {
		// Convert screen coordinates to world coordinates
		const worldX = (screenX - this.viewport.offsetX) / this.viewport.scale;
		const worldY = (screenY - this.viewport.offsetY) / this.viewport.scale;

		// Check each item for collision
		for (const item of this.items.values()) {
			if (
				worldX >= item.x &&
				worldX <= item.x + item.width &&
				worldY >= item.y &&
				worldY <= item.y + item.height
			) {
				return item;
			}
		}

		return undefined;
	}

	/**
	 * Add an item to the canvas
	 */
	public addItem(item: CanvasItem): void {
		this.items.set(item.id, item);
		this.render();
	}

	/**
	 * Remove an item from the canvas
	 */
	public removeItem(id: string): void {
		this.items.delete(id);
		this.render();
	}

	/**
	 * Get all items on the canvas
	 */
	public getItems(): CanvasItem[] {
		return Array.from(this.items.values());
	}

	/**
	 * Clear all items from the canvas
	 */
	public clearItems(): void {
		this.items.clear();
		this.render();
	}

	/**
	 * Set viewport state (zoom and pan)
	 */
	public setViewport(viewport: ViewportState): void {
		this.viewport = { ...viewport };
		this._onViewportChanged.fire(this.viewport);
		this.render();
	}

	/**
	 * Get current viewport state
	 */
	public getViewport(): ViewportState {
		return { ...this.viewport };
	}

	/**
	 * Render the entire canvas
	 */
	public render(): void {
		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Save context state
		this.ctx.save();

		// Apply viewport transformation
		this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
		this.ctx.scale(this.viewport.scale, this.viewport.scale);

		// Render grid background
		this.renderGrid();

		// Render all items
		for (const item of this.items.values()) {
			this.renderItem(item);
		}

		// Restore context state
		this.ctx.restore();
	}

	/**
	 * Render grid background
	 */
	private renderGrid(): void {
		const gridSize = 50;
		const lineWidth = 1 / this.viewport.scale;

		this.ctx.strokeStyle = "#f0f0f0";
		this.ctx.lineWidth = lineWidth;
		this.ctx.globalAlpha = 0.3;

		// Calculate visible area
		const startX =
			Math.floor(-this.viewport.offsetX / this.viewport.scale / gridSize) *
			gridSize;
		const endX = startX + this.canvas.width / this.viewport.scale + gridSize;
		const startY =
			Math.floor(-this.viewport.offsetY / this.viewport.scale / gridSize) *
			gridSize;
		const endY = startY + this.canvas.height / this.viewport.scale + gridSize;

		// Draw vertical lines
		for (let x = startX; x <= endX; x += gridSize) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, startY);
			this.ctx.lineTo(x, endY);
			this.ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = startY; y <= endY; y += gridSize) {
			this.ctx.beginPath();
			this.ctx.moveTo(startX, y);
			this.ctx.lineTo(endX, y);
			this.ctx.stroke();
		}

		this.ctx.globalAlpha = 1.0;
	}

	/**
	 * Render a single canvas item
	 */
	private renderItem(item: CanvasItem): void {
		this.ctx.save();

		// Set style based on item type
		switch (item.type) {
			case "file":
				this.ctx.fillStyle = "#007acc";
				this.ctx.strokeStyle = "#005a9e";
				break;
			case "folder":
				this.ctx.fillStyle = "#ffb347";
				this.ctx.strokeStyle = "#e09000";
				break;
			case "note":
				this.ctx.fillStyle = "#90ee90";
				this.ctx.strokeStyle = "#32cd32";
				break;
			default:
				this.ctx.fillStyle = "#d0d0d0";
				this.ctx.strokeStyle = "#a0a0a0";
		}

		this.ctx.lineWidth = 2 / this.viewport.scale;

		// Draw rectangle
		this.ctx.fillRect(item.x, item.y, item.width, item.height);
		this.ctx.strokeRect(item.x, item.y, item.width, item.height);

		// Draw label
		if (item.data?.name) {
			this.ctx.fillStyle = "#ffffff";
			this.ctx.font = `${12 / this.viewport.scale}px Arial`;
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.fillText(
				item.data.name,
				item.x + item.width / 2,
				item.y + item.height / 2
			);
		}

		this.ctx.restore();
	}

	/**
	 * Focus on a specific item by centering it in the viewport
	 */
	public focusOnItem(itemId: string): void {
		const item = this.items.get(itemId);
		if (!item) return;

		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;

		this.viewport.offsetX =
			centerX - (item.x + item.width / 2) * this.viewport.scale;
		this.viewport.offsetY =
			centerY - (item.y + item.height / 2) * this.viewport.scale;

		this._onViewportChanged.fire(this.viewport);
		this.render();
	}

	/**
	 * Fit all items in the viewport
	 */
	public fitToItems(): void {
		if (this.items.size === 0) return;

		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;

		for (const item of this.items.values()) {
			minX = Math.min(minX, item.x);
			minY = Math.min(minY, item.y);
			maxX = Math.max(maxX, item.x + item.width);
			maxY = Math.max(maxY, item.y + item.height);
		}

		const padding = 50;
		const contentWidth = maxX - minX + 2 * padding;
		const contentHeight = maxY - minY + 2 * padding;

		const scaleX = this.canvas.width / contentWidth;
		const scaleY = this.canvas.height / contentHeight;
		this.viewport.scale = Math.min(scaleX, scaleY, 1.0);

		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;

		this.viewport.offsetX =
			this.canvas.width / 2 - centerX * this.viewport.scale;
		this.viewport.offsetY =
			this.canvas.height / 2 - centerY * this.viewport.scale;

		this._onViewportChanged.fire(this.viewport);
		this.render();
	}
}
