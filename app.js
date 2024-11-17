// Workout class
class Workout {
    constructor(type, duration, calories) {
        this.id = Date.now();
        this.type = type;
        this.duration = duration;
        this.calories = calories;
        this.date = new Date().toISOString();
        this.completed = false;
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
        this.aiAnalytics = new AIAnalytics();
        this.recommendationsContainer = document.getElementById('aiRecommendations');
        
        // Aktualisiere KI-Erkenntnisse alle 30 Sekunden
        setInterval(() => this.updateAIInsights(), 30000);

        // Workout-Vorschläge
        this.workoutSuggestions = new Set(['Running', 'Cycling', 'Swimming', 'Strength Training', 
            'Yoga', 'HIIT', 'Boxing', 'Pilates']);
        
        if (this.workoutForm) {
            this.setupAutocomplete();
        }
    }

    setupAutocomplete() {
        const datalist = document.createElement('datalist');
        datalist.id = 'workout-suggestions';
        this.workoutSuggestions.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            datalist.appendChild(option);
        });
        document.body.appendChild(datalist);
        this.workoutType.setAttribute('list', 'workout-suggestions');
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
        if (!this.workoutList) return;
        
        this.workoutList.innerHTML = '';
        const sortedWorkouts = [...this.workouts].reverse();
        
        sortedWorkouts.forEach((workout, index) => {
            const workoutElement = document.createElement('div');
            workoutElement.className = 'workout-item fade-in';
            workoutElement.style.animationDelay = `${index * 0.1}s`;
            
            const date = new Date(workout.date);
            const formattedDate = new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);

            workoutElement.innerHTML = `
                <div class="workout-header">
                    <h3>${workout.type}</h3>
                    <span class="workout-date">${formattedDate}</span>
                </div>
                <div class="workout-stats">
                    <div class="workout-stat">
                        <i data-lucide="clock"></i>
                        <span>${workout.duration} min</span>
                    </div>
                    <div class="workout-stat">
                        <i data-lucide="flame"></i>
                        <span>${workout.calories} kcal</span>
                    </div>
                    <button class="delete-workout" data-id="${workout.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            
            this.workoutList.appendChild(workoutElement);
        });

        // Event-Listener für Lösch-Buttons
        document.querySelectorAll('.delete-workout').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.deleteWorkout(id);
            });
        });

        lucide.createIcons();
    }

    saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts));
    }

    loadWorkouts() {
        const storedWorkouts = localStorage.getItem('workouts');
        this.workouts = storedWorkouts ? JSON.parse(storedWorkouts) : [];
    }

    updateAIInsights() {
        if (!this.recommendationsContainer) return;
        
        const recommendations = this.aiAnalytics.analyzeWorkouts(this.workouts);
        this.recommendationsContainer.innerHTML = recommendations
            .map(rec => `
                <div class="ai-recommendation ${rec.type}">
                    <i data-lucide="${this.getRecommendationIcon(rec.type)}"></i>
                    <p>${rec.message}</p>
                </div>
            `)
            .join('');
        
        lucide.createIcons();
    }

    getRecommendationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'warning': return 'alert-triangle';
            case 'error': return 'x-circle';
            default: return 'info';
        }
    }

    deleteWorkout(id) {
        this.workouts = this.workouts.filter(workout => workout.id !== id);
        this.saveWorkouts();
        this.updateStats();
        this.renderWorkouts();
        this.updateAIInsights();
    }
}

// AI Analytics class
class AIAnalytics {
    constructor() {
        this.workoutPatterns = {};
        this.recommendations = [];
    }

    analyzeWorkouts(workouts) {
        // Musteranalyse
        this.analyzePatterns(workouts);
        // Leistungstrends
        this.analyzeTrends(workouts);
        // Empfehlungen generieren
        return this.generateRecommendations();
    }

    analyzePatterns(workouts) {
        workouts.forEach(workout => {
            if (!this.workoutPatterns[workout.type]) {
                this.workoutPatterns[workout.type] = {
                    count: 0,
                    avgDuration: 0,
                    avgCalories: 0
                };
            }
            
            const pattern = this.workoutPatterns[workout.type];
            pattern.count++;
            pattern.avgDuration = (pattern.avgDuration * (pattern.count - 1) + workout.duration) / pattern.count;
            pattern.avgCalories = (pattern.avgCalories * (pattern.count - 1) + workout.calories) / pattern.count;
        });
    }

    analyzeTrends(workouts) {
        if (workouts.length < 2) return;
        
        const recentWorkouts = workouts.slice(-5);
        const caloriesTrend = this.calculateTrend(recentWorkouts.map(w => w.calories));
        const durationTrend = this.calculateTrend(recentWorkouts.map(w => w.duration));

        if (caloriesTrend < 0) {
            this.recommendations.push({
                type: 'warning',
                message: 'Dein Kalorienverbrauch sinkt. Versuche die Intensität zu erhöhen.'
            });
        }

        if (durationTrend > 0) {
            this.recommendations.push({
                type: 'success',
                message: 'Großartig! Deine Trainingsausdauer verbessert sich.'
            });
        }
    }

    calculateTrend(values) {
        const n = values.length;
        if (n < 2) return 0;
        
        const xMean = (n - 1) / 2;
        const yMean = values.reduce((a, b) => a + b) / n;
        
        let numerator = 0;
        let denominator = 0;
        
        values.forEach((y, x) => {
            numerator += (x - xMean) * (y - yMean);
            denominator += Math.pow(x - xMean, 2);
        });
        
        return denominator ? numerator / denominator : 0;
    }

    generateRecommendations() {
        const recommendations = [...this.recommendations];
        
        // Workout-Typ-Empfehlungen
        const workoutTypes = Object.keys(this.workoutPatterns);
        if (workoutTypes.length === 1) {
            recommendations.push({
                type: 'info',
                message: 'Versuche verschiedene Trainingsarten für bessere Ergebnisse.'
            });
        }

        return recommendations;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new UI();
});
