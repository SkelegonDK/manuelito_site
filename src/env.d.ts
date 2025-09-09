/// <reference types="astro/client" />

type ENV = {
  // Define your environment variables here
};

declare namespace App {
  interface Locals {
    // Add any local variables here
  }
}

// Augment the IntrinsicElements interface for JSX/TSX
declare namespace astroHTML.JSX {
  interface ButtonHTMLAttributes {
    formsappId?: string; // Make formsappId an optional valid attribute for buttons
  }
} 