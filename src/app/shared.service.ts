import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor() {}

  calculateAge(dateOfBirth: string | Date | undefined): number | undefined {
    if (!dateOfBirth) {
      return undefined; // Handle cases where date of birth is not provided
    }

    const birthDate =
      typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

    if (isNaN(birthDate.getTime())) {
      return undefined; // Handle invalid date strings
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
