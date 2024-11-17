// Workout class
class Workout {
    constructor(type, duration, calories) {
        this.id = Date.now();
        this.type = type;
        this.duration = duration;
        this.calories = calories;
    }
}

// UI class
class UI {
    constructor() {
        this.workouts = [];
        this.totalWorkouts = document.getElementById('totalWorkouts');
        this.totalDuration = document.getElementById('totalDuration');
        this.totalCalories = document.getElementById('totalCalories');
        this.workoutList = document.getElementById('workoutList');
        this.workoutForm = document.getElementById('workoutForm');

        // Check if we're on the tracker page
        if (this.workoutForm) {
            this.workoutType = document.getElementById('workoutType');
            this.duration = document.getElementById('duration');
            this.calories = document.getElementById('calories');
            this.workoutForm.addEventListener('submit', this.addWorkout.bind(this));
        }

        this.loadWorkouts();
        this.updateStats();
    }

    addWorkout(e) {
        e.preventDefault();
        const workout = new Workout(
            this.workoutType.value,
            parseFloat(this.duration.value),
            parseInt(this.calories.value)
        );
        this.workouts.push(workout);
        this.saveWorkouts();
        this.updateStats();
        this.renderWorkouts();
        this.workoutForm.reset();
    }

    updateStats() {
        if (this.totalWorkouts) {
            this.totalWorkouts.textContent = this.workouts.length;
            this.totalDuration.textContent = `${this.workouts.reduce((sum, workout) => sum + workout.duration, 0).toFixed(0)} min`;
            this.totalCalories.textContent = this.workouts.reduce((sum, workout) => sum + workout.calories, 0);
        }
    }

    renderWorkouts() {
        if (this.workoutList) {
            this.workoutList.innerHTML = '';
            this.workouts.forEach((workout, index) => {
                const workoutElement = document.createElement('div');
                workoutElement.className = 'workout-item fade-in';
                workoutElement.style.animationDelay = `${index * 0.1}s`;
                workoutElement.innerHTML = `
                    <p><strong>${workout.type}</strong></p>
                    <p>Duration: ${workout.duration} minutes</p>
                    <p>Calories: ${workout.calories}</p>
                `;
                this.workoutList.appendChild(workoutElement);
            });
        }
    }

    saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts));
    }

    loadWorkouts() {
        const storedWorkouts = localStorage.getItem('workouts');
        this.workouts = store

dWorkouts ? JSON.parse(storedWorkouts) : [];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new UI();
});