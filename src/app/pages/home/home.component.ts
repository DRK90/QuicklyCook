import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
interface RecipeReturnDto {
  recipeName: string;
  recipeDescription: string;
  recipeType: string;
  recipeNotes: string[];
  userRecipeRating: number | null;
  averageRecipeRating: number | null;
  recipePrepTime: number;
  recipeCookTime: number;
  recipeCreatedDate: string; // ISO date string
  ingredients: { ingredientId: number; ingredientName: string; ingredientQuantity: string }[];
  recipeSteps: { stepNumber: number; stepDescription: string }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatLabel,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  recipeQuery: string = '';
  recipe: RecipeReturnDto | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  apiUrl = environment.apiUrl;
  recentRecipes: RecipeReturnDto[] = [];


  constructor(private router: Router, private http: HttpClient) {}

  onSearch(): void {
    if (this.recipeQuery.trim()) {
      this.isLoading = true;
      this.errorMessage = '';
      // Build the request payload.
      const requestBody = { recipeDescription: this.recipeQuery };
      this.http.post<RecipeReturnDto>(`${this.apiUrl}/ExApi/PostRecipeRequest`, requestBody)
        .subscribe({
          next: (data) => {
            this.recipe = data;
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error fetching recipe:', error);
            this.errorMessage = 'Failed to fetch recipe. Please try again later.';
            this.isLoading = false;
          }
        });
    }
  }

  onShowMoreRecentRecipes(): void {
    // Call the GET endpoint to retrieve recent recipes.
    this.http.get<RecipeReturnDto[]>(`${this.apiUrl}/ExApi/GetRecentRecipes`)
      .subscribe({
        next: (data) => {
          if(this.recipe) {
            this.recentRecipes = data.slice(1);
          } else {
            this.recentRecipes = data;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching recent recipes:', error);
        }
      });
  }
}
