/// <reference types="cypress"/>

describe('smoke', () => {
  it('visits site', () => {
    cy.visit('http://localhost:3000/');
  });
});

export {};
