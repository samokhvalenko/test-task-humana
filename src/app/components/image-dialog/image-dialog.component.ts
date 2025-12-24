import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { PolygonsActions, PointN } from '../../store/polygons/polygons.actions';
import { selectImageEntities } from '../../store/images/images.reducer';
import { selectPolygonEntities } from '../../store/polygons/polygons.reducer';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface ImageDialogData {
  itemId: string;
  seed: string;
}

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatSliderModule],
  template: `
    <div class="dialog-container">
      <div class="header">
        <h3>Shape Editor - {{ data.seed }}</h3>
        <button mat-stroked-button color="primary" (click)="close()">Close</button>
      </div>

      <div class="canvas-wrap" #wrap>
        <img #img [src]="imageUrl" (load)="onImageLoad()" alt="image" />
        <canvas #canvas></canvas>
      </div>

      <div class="controls">
        <button mat-raised-button color="primary" (click)="startNewPolygon()">Start New Polygon</button>
        <button mat-stroked-button (click)="clearPolygon()">Clear</button>
        <div class="slider">
          <span>Rotate</span>
          <input type="range" min="-180" max="180" step="1" [value]="angle" (input)="onAngleInput($event)" />
          <span>{{ angle }}°</span>
        </div>
      </div>
      <p class="hint">Click to add points. Drag inside polygon to move. Use slider to rotate. Polygon persists per item.</p>
    </div>
  `,
  styles: [`
    .dialog-container { width: min(90vw, 900px); max-width: 95vw; }
    .header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 8px; }
    .canvas-wrap { position: relative; width: 100%; aspect-ratio: 4/3; background: #111; border-radius: 8px; overflow: hidden; }
    img { position:absolute; inset:0; width:100%; height:100%; object-fit: contain; }
    canvas { position:absolute; inset:0; width:100%; height:100%; }
    .controls { display:flex; align-items:center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
    .slider { display:flex; align-items:center; gap:8px; min-width: 240px; }
    .hint { color: rgba(0,0,0,0.6); font-size: 12px; margin-top: 6px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDialogComponent implements AfterViewInit, OnDestroy {
  private readonly store = inject<Store<AppState>>(Store as any);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wrap') wrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('img') imgRef!: ElementRef<HTMLImageElement>;

  imageUrl = '';
  points: PointN[] = [];
  angle = 0;
  private dragging = false;
  private lastPos: { x: number; y: number } | null = null;

  constructor(
    private dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageDialogData
  ) {
    // Load image URL from store
    this.store.select(selectImageEntities).pipe(
      map(entities => entities[data.itemId]?.large || entities[data.itemId]?.medium || entities[data.itemId]?.thumbnail || ''),
      takeUntil(this.destroy$)
    ).subscribe(url => this.imageUrl = url);

    // Load polygon from store
    this.store.select(selectPolygonEntities).pipe(
      map(entities => entities[data.itemId]),
      takeUntil(this.destroy$)
    ).subscribe(poly => {
      this.points = poly?.points ?? [];
      this.angle = poly?.angleDeg ?? 0;
      this.render();
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousedown', this.onDown);
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('mouseup', this.onUp);
    window.addEventListener('resize', () => this.render());
    this.render();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) canvas.removeEventListener('mousedown', this.onDown);
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup', this.onUp);
  }

  close() { this.dialogRef.close(); }

  startNewPolygon() {
    this.points = [];
    this.angle = 0;
    this.pushToStore();
    this.render();
  }

  clearPolygon() {
    this.points = [];
    this.angle = 0;
    this.pushToStore();
    this.render();
  }

  setAngle(v: number) {
    this.angle = v;
    // Only rotate polygon in store; don't reset polygon via setPolygon here
    this.store.dispatch(PolygonsActions.rotatePolygon({ itemId: this.data.itemId, angleDeg: this.angle }));
    this.render();
  }

  onAngleInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const value = target ? Number(target.value) : 0;
    this.setAngle(value);
  }

  onImageLoad() { this.render(); }

  // Mouse handlers
  onDown = (ev: MouseEvent) => {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;

    if (ev.button === 0) {
      if (this.isInside({ x, y })) {
        this.dragging = true;
        this.lastPos = { x, y };
      } else {
        // add point
        this.points = [...this.points, { x, y }];
        this.pushToStore();
        this.render();
      }
    }
  };

  onMove = (ev: MouseEvent) => {
    if (!this.dragging || !this.lastPos) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;
    const dx = x - this.lastPos.x;
    const dy = y - this.lastPos.y;
    this.lastPos = { x, y };
    this.points = this.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    this.pushToStore();
    this.render();
  };

  onUp = (_: MouseEvent) => {
    this.dragging = false;
    this.lastPos = null;
  };

  // Rendering
  render() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // draw polygon
    if (this.points.length > 0) {
      ctx.save();
      // apply rotation around center in pixel space
      const center = this.center(this.points);
      const cx = center.x * rect.width;
      const cy = center.y * rect.height;
      const rad = (this.angle * Math.PI) / 180;
      ctx.translate(cx, cy);
      ctx.rotate(rad);
      ctx.translate(-cx, -cy);

      ctx.beginPath();
      this.points.forEach((p, i) => {
        const px = p.x * rect.width;
        const py = p.y * rect.height;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00bcd4';
      ctx.fillStyle = 'rgba(0, 188, 212, 0.15)';
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  center(points: PointN[]) { const n = points.length || 1; return { x: points.reduce((s,p)=>s+p.x,0)/n, y: points.reduce((s,p)=>s+p.y,0)/n }; }

  isInside(pt: PointN): boolean {
    // Use ray-casting on rotated polygon state
    if (this.points.length < 3) return false;
    // inverse-rotate point by current angle around center then test against unrotated points
    const c = this.center(this.points);
    const rad = (-this.angle * Math.PI) / 180;
    const x = c.x + (pt.x - c.x) * Math.cos(rad) - (pt.y - c.y) * Math.sin(rad);
    const y = c.y + (pt.x - c.x) * Math.sin(rad) + (pt.y - c.y) * Math.cos(rad);

    let inside = false;
    const pts = this.points;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x, yi = pts[i].y;
      const xj = pts[j].x, yj = pts[j].y;
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private pushToStore() {
    if (this.points.length === 0) {
      this.store.dispatch(PolygonsActions.clearPolygon({ itemId: this.data.itemId }));
    } else {
      this.store.dispatch(PolygonsActions.setPolygon({ itemId: this.data.itemId, points: this.points }));
      this.store.dispatch(PolygonsActions.rotatePolygon({ itemId: this.data.itemId, angleDeg: this.angle }));
    }
  }
}
