import { Component, OnInit } from '@angular/core';
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
import { UserService } from '../../Service/user.service';
import { Subscription } from 'rxjs';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
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
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  recipeQuery: string = '';
  recipe: RecipeReturnDto | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  apiUrl = environment.apiUrl;
  recentRecipes: RecipeReturnDto[] = [];
  userId: string | null = null;
  private userIdSubscription: Subscription = new Subscription();

  constructor(private router: Router, private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.userIdSubscription = this.userService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
  }

  ngOnDestroy(): void {
    this.userIdSubscription.unsubscribe();
  }

  onSearch(): void {
    if (this.recipeQuery.trim()) {
      this.isLoading = true;
      this.errorMessage = '';
      // Build the request payload.
      const requestBody = { recipeDescription: this.recipeQuery, userId: this.userId };
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

  onShowMoreUserRecipes(): void {
    console.log(this.userId);
    if (!this.userId) {
      console.error("User ID is missing!");
      return;
    }
    // Call the GET endpoint to retrieve recent recipes for the current user.
    this.http.get<RecipeReturnDto[]>(`${this.apiUrl}/ExApi/GetUserRecentRecipes/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.recentRecipes = data;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching recent recipes:', error);
        }
      });
  }
}
