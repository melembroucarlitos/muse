/// <reference types="cypress"/>

describe('smoke', () => {
  it('Makes sure the hello message is up', () => {
    cy.visit('http://localhost:3000/').contains('Hello World!');
  });
});

export {};
