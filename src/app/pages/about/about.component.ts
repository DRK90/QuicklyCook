import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.loadDrawIoViewer();
  }

  loadDrawIoViewer(): void {
    const script = this.renderer.createElement('script');
    script.src = 'https://app.diagrams.net/js/viewer-static.min.js';
    script.type = 'text/javascript';
    script.onload = () => {
      console.log('Draw.io Viewer Loaded');
    };
    document.body.appendChild(script);
  }
}
