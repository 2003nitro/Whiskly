import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { db } from '../../firebase';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private router: Router,
    private firestore: AngularFirestore
  ) {}


  login(event: Event): void {
    console.log(this.firestore.collection('users').get().subscribe(snapshot => {
    snapshot.forEach(doc => console.log(doc.id, doc.data()))
  }));
    this.router.navigate(['home']);
  }
}
