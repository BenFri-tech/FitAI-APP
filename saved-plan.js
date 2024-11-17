class SavedPlan {
    constructor() {
        this.savedPlanContent = document.getElementById('savedPlanContent');
        this.noPlanMessage = document.getElementById('noPlanMessage');
        this.deleteButton = document.getElementById('deletePlan');
        
        this.loadSavedPlan();
        
        if (this.deleteButton) {
            this.deleteButton.addEventListener('click', () => this.deletePlan());
        }
    }

    loadSavedPlan() {
        const savedPlan = localStorage.getItem('savedTrainingPlan');
        
        if (savedPlan) {
            const plan = JSON.parse(savedPlan);
            this.displayPlan(plan);
            this.noPlanMessage.style.display = 'none';
            this.deleteButton.style.display = 'flex';
        } else {
            this.savedPlanContent.innerHTML = '';
            this.noPlanMessage.style.display = 'flex';
            this.deleteButton.style.display = 'none';
        }
    }

    displayPlan(plan) {
        this.savedPlanContent.innerHTML = `
            <div class="plan-info">
                <p><strong>Created:</strong> ${new Date(plan.createdAt).toLocaleDateString('de-DE')}</p>
                <p><strong>Fitness Level:</strong> ${plan.fitnessLevel}</p>
            </div>
            ${plan.days.map(day => `
                <div class="plan-day">
                    <div class="plan-day-header">
                        <h3>${day.day}</h3>
                        <span class="badge">${day.focus}</span>
                    </div>
                    <div class="exercise-list">
                        ${day.exercises.map(exercise => `
                            <div class="exercise-item">
                                <span>${exercise.name}</span>
                                <span>${exercise.sets} sets × ${exercise.reps}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    deletePlan() {
        if (confirm('Are you sure you want to delete your saved training plan?')) {
            localStorage.removeItem('savedTrainingPlan');
            this.loadSavedPlan();
        }
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SavedPlan();
}); 