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
  recipeId: number;
  recipeName: string;
  recipeDescription: string;
  recipeType: string;
  recipeNotes: string[];
  userRecipeRating: number | null;
  averageRecipeRating: number | null;
  recipePrepTime: number;
  recipeCookTime: number;
  recipeCreatedDate: string; // ISO date string
  ingredients: { ingredientId: number; ingredientName: string; ingredientQuantity: number; ingredientUnit: string }[];
  recipeSteps: { stepNumber: number; stepDescription: string }[];
    // Added for edit functionality
    isEditing?: boolean;
    editData?: any;
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

  saveRecipe(recipeId: number): void {
    if (!this.userId) {
      console.error('User ID is not available');
      return;
    }

    const payload = {
      userId: this.userId,
      recipeId: recipeId
    };

    console.log(payload);

    this.http.post(`${this.apiUrl}/ExApi/SaveRecipe`, payload).subscribe(
      response => {
        console.log('Recipe saved successfully:', response);
        // Optionally, you can show a success message or update the UI
      },
      error => {
        console.error('Error saving recipe:', error);
        // Optionally, handle the error (e.g., show an error message)
      }
    );
  }

  // Start editing a recipe
startEditing(recipe: RecipeReturnDto): void {
  // Create a deep copy of recipe data for editing
  recipe.isEditing = true;
  recipe.editData = JSON.parse(JSON.stringify({
    recipeName: recipe.recipeName,
    recipeType: recipe.recipeType,
    recipeDescription: recipe.recipeDescription,
    recipePrepTime: recipe.recipePrepTime,
    recipeCookTime: recipe.recipeCookTime,
    ingredients: recipe.ingredients || [],
    recipeSteps: recipe.recipeSteps || [],
    recipeNotes: recipe.recipeNotes || []
  }));
}

// Cancel editing and discard changes
cancelEditing(recipe: RecipeReturnDto): void {
  recipe.isEditing = false;
  recipe.editData = undefined;
}

// Save edits to the recipe
saveEdits(recipe: RecipeReturnDto): void {
  // Apply edits to the recipe
  recipe.recipeName = recipe.editData.recipeName;
  recipe.recipeType = recipe.editData.recipeType;
  recipe.recipeDescription = recipe.editData.recipeDescription;
  recipe.recipePrepTime = recipe.editData.recipePrepTime;
  recipe.recipeCookTime = recipe.editData.recipeCookTime;
  recipe.ingredients = recipe.editData.ingredients;
  recipe.recipeSteps = recipe.editData.recipeSteps;
  recipe.recipeNotes = recipe.editData.recipeNotes;
  
  // Exit edit mode
  recipe.isEditing = false;
  recipe.editData = undefined;
  
  // TODO: Call your API to update the recipe
  // this.updateRecipe(recipe);
}

// Add a new ingredient
addIngredient(recipe: RecipeReturnDto): void {
  recipe.editData.ingredients.push({
    ingredientId: 0, // Will be assigned by the server
    ingredientName: '',
    ingredientQuantity: 1,
    ingredientUnit: ''
  });
}

// Remove an ingredient
removeIngredient(recipe: RecipeReturnDto, index: number): void {
  recipe.editData.ingredients.splice(index, 1);
}

// Add a new step
addStep(recipe: RecipeReturnDto): void {
  const nextStepNumber = recipe.editData.recipeSteps.length + 1;
  recipe.editData.recipeSteps.push({
    stepNumber: nextStepNumber,
    stepDescription: ''
  });
}

// Remove a step
removeStep(recipe: RecipeReturnDto, index: number): void {
  recipe.editData.recipeSteps.splice(index, 1);
  // Re-number the steps
  recipe.editData.recipeSteps.forEach((step: { stepNumber: number; stepDescription: string }, i: number) => {
    step.stepNumber = i + 1;
  });
}

// Add a new note
addNote(recipe: RecipeReturnDto): void {
  recipe.editData.recipeNotes.push('');
}

// Remove a note
removeNote(recipe: RecipeReturnDto, index: number): void {
  recipe.editData.recipeNotes.splice(index, 1);
}
}
