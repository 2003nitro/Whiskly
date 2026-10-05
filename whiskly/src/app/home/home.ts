import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../categories';

@Component({
  imports: [ RouterLink ],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  categories = CATEGORIES;
}
