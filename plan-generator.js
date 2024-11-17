class TrainingPlanGenerator {
    constructor() {
        this.form = document.getElementById('planGeneratorForm');
        this.planContainer = document.getElementById('trainingPlan');
        
        this.form.addEventListener('submit', this.generatePlan.bind(this));
        
        this.exercises = {
            beginner: {
                push: ['Push-Ups', 'Bench Press', 'Shoulder Press'],
                pull: ['Pull-Ups', 'Rows', 'Face Pulls'],
                legs: ['Squats', 'Lunges', 'Calf Raises'],
                core: ['Planks', 'Crunches', 'Russian Twists']
            },
            intermediate: {
                push: ['Diamond Push-Ups', 'Incline Bench Press', 'Military Press'],
                pull: ['Weighted Pull-Ups', 'Barbell Rows', 'Lat Pulldowns'],
                legs: ['Front Squats', 'Romanian Deadlifts', 'Box Jumps'],
                core: ['Hanging Leg Raises', 'Ab Wheel', 'Side Planks']
            },
            advanced: {
                push: ['One-Arm Push-Ups', 'Decline Bench Press', 'Handstand Push-Ups'],
                pull: ['Muscle-Ups', 'Weighted Chin-Ups', 'Power Cleans'],
                legs: ['Pistol Squats', 'Olympic Lifts', 'Plyometric Lunges'],
                core: ['Dragon Flags', 'Toes to Bar', 'Windshield Wipers']
            }
        };
    }

    generatePlan(e) {
        e.preventDefault();
        
        const age = parseInt(document.getElementById('age').value);
        const height = parseInt(document.getElementById('height').value);
        const weight = parseInt(document.getElementById('weight').value);
        const fitnessLevel = document.getElementById('fitnessLevel').value;

        const plan = this.createTrainingPlan(age, height, weight, fitnessLevel);
        this.displayPlan(plan);
    }

    createTrainingPlan(age, height, weight, fitnessLevel) {
        const bmi = weight / ((height / 100) ** 2);
        const daysPerWeek = this.calculateTrainingDays(age, bmi, fitnessLevel);
        
        const plan = {
            fitnessLevel: fitnessLevel,
            days: []
        };

        for (let i = 1; i <= daysPerWeek; i++) {
            const dayPlan = this.generateDayPlan(i, fitnessLevel);
            plan.days.push(dayPlan);
        }
        
        return plan;
    }

    calculateTrainingDays(age, bmi, fitnessLevel) {
        if (fitnessLevel === 'beginner') return 3;
        if (fitnessLevel === 'intermediate') return 4;
        return 5;
    }

    generateDayPlan(day, fitnessLevel) {
        const exercises = this.exercises[fitnessLevel];
        let dayFocus;
        
        switch (day % 3) {
            case 1: dayFocus = ['push', 'core']; break;
            case 2: dayFocus = ['pull', 'core']; break;
            case 0: dayFocus = ['legs', 'core']; break;
        }

        const dayExercises = dayFocus.flatMap(focus => {
            return this.selectExercises(exercises[focus], focus === 'core' ? 2 : 3);
        });

        return {
            day: `Day ${day}`,
            focus: dayFocus.join(' & ').toUpperCase(),
            exercises: dayExercises.map(exercise => ({
                name: exercise,
                sets: this.calculateSets(fitnessLevel),
                reps: this.calculateReps(fitnessLevel, exercise)
            }))
        };
    }

    selectExercises(exercisePool, count) {
        return exercisePool
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    calculateSets(fitnessLevel) {
        switch(fitnessLevel) {
            case 'beginner': return 3;
            case 'intermediate': return 4;
            case 'advanced': return 5;
        }
    }

    calculateReps(fitnessLevel, exercise) {
        if (exercise.includes('Plank')) return '30-45 sec';
        
        switch(fitnessLevel) {
            case 'beginner': return '8-12';
            case 'intermediate': return '10-15';
            case 'advanced': return '12-20';
        }
    }

    displayPlan(plan) {
        const html = `
            <h2 class="card-title">Your Generated Training Plan</h2>
            <div class="plan-info">
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
            <button class="save-plan-btn" id="savePlanBtn">
                <i data-lucide="save"></i> Save This Plan
            </button>
        `;

        this.planContainer.innerHTML = html;
        this.planContainer.style.display = 'block';
        
        // Event-Listener für den Save Button
        document.getElementById('savePlanBtn').addEventListener('click', () => this.savePlan(plan));
        
        lucide.createIcons();
    }

    savePlan(plan) {
        const planToSave = {
            ...plan,
            createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem('savedTrainingPlan', JSON.stringify(planToSave));
        alert('Training plan saved successfully!');
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TrainingPlanGenerator();
}); 