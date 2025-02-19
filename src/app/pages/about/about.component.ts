import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private scriptLoaded = false; // To prevent duplicate script injections

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    if (!this.scriptLoaded) {
      this.loadDrawIoViewer();
      this.scriptLoaded = true;
    }
  }

  loadDrawIoViewer(): void {
    const script = this.renderer.createElement('script');
    script.src = 'https://app.diagrams.net/js/viewer-static.min.js';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Draw.io Viewer Loaded');
    };

    // Append to head instead of body to ensure proper script execution
    this.renderer.appendChild(this.document.head, script);
  }
}
