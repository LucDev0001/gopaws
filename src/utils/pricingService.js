// src/utils/pricingService.js
export const pricingService = {
  /**
   * Calculates the price of a walk based on multiple factors.
   * @param {number} duration - Duration in minutes.
   * @param {object} pet - The pet object (containing age, breed, etc.).
   * @returns {number} - The calculated price.
   */
  calculatePrice(duration, pet = {}) {
    const BASE_FEE = 10; // R$10 taxa base (Ajustado para mercado RJ)
    const RATE_PER_MINUTE = 0.5; // R$0,50 por minuto (Ajustado)

    let price = BASE_FEE + duration * RATE_PER_MINUTE;

    // Surcharge for pet age (e.g., puppies or senior dogs)
    if (pet.age && (pet.age < 1 || pet.age > 8)) {
      price += 5; // Adicional de R$5 para filhotes ou idosos
    }

    // Surcharge for time of day (e.g., peak hours)
    const currentHour = new Date().getHours();
    if (currentHour >= 17 || currentHour <= 8) {
      price += 7; // Adicional de R$7 para horários de pico/noturnos
    }

    // Surcharge for specific breeds (example)
    const largeBreeds = [
      "golden retriever",
      "labrador",
      "german shepherd",
      "rottweiler",
    ];
    if (pet.breed && largeBreeds.includes(pet.breed.toLowerCase())) {
      price += 5; // Adicional de R$5 para porte grande
    }

    return Math.round(price); // Arredonda para o inteiro mais próximo
  },
};
