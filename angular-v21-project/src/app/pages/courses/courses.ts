import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})
export class Courses {}
