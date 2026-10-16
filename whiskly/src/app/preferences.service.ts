import {Injectable, signal } from '@angular/core';

const KEY = 'whiskly:showPhotos';

@Injectable ({ providedIn: 'root' })
export class PreferencesService {
    showPhotos = signal(this.read());
    
    setShowPhotos(value: boolean): void {
        this.showPhotos.set(value);
        try{
            localStorage.setItem(KEY, JSON.stringify(value));
        } catch {

        }
    }

    private read(): boolean {
        try{
            const raw = localStorage.getItem(KEY);
            return raw === null ? true : JSON.parse(raw) === true;
        } catch {
            return true;
        }
    }
}