/* global cy */

describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:5000/api/auth/register', {
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
    });
    cy.request('POST', 'http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    }).then((res) => {
      cy.setCookie('connect.sid', res.headers['set-cookie'][0].split(';')[0].split('=')[1]);
    });
    cy.visit('/admin');
  });

  it('should upload an image via file input', () => {
    cy.get('#image input[type="file"]').attachFile('test-image.jpg');
    cy.get('button').contains('Upload Image').click();
    cy.get('.alert-success').should('contain', 'Image uploaded successfully');
    cy.get('img[alt="Preview of uploaded question image"]').should('be.visible');
  });

  it('should upload an image via drag and drop', () => {
    cy.get('#image div').trigger('dragover');
    cy.get('#image div').trigger('drop', {
      dataTransfer: { files: [new File(['fake image'], 'test-image.jpg', { type: 'image/jpeg' })] },
    });
    cy.get('button').contains('Upload Image').click();
    cy.get('.alert-success').should('contain', 'Image uploaded successfully');
    cy.get('img[alt="Preview of uploaded question image"]').should('be.visible');
  });

  it('should create a question with an image', () => {
    cy.get('#image input[type="file"]').attachFile('test-image.jpg');
    cy.get('button').contains('Upload Image').click();
    cy.get('.alert-success').should('contain', 'Image uploaded successfully');
    cy.get('img[alt="Preview of uploaded question image"]').should('be.visible');
    cy.get('#questionText').type('Test question');
    cy.get('#type').select('numeric');
    cy.get('#difficulty').select('easy');
    cy.get('#testCases').type('[{"input":"1","output":"2"}]');
    cy.get('button').contains('Create Question').click();
    cy.get('.alert-success').should('contain', 'Question created successfully');
    cy.get('table').contains('Test question');
  });

  it('should create a question without expectedAnswer', () => {
    cy.get('#questionText').type('Test question no answer');
    cy.get('#type').select('numeric');
    cy.get('#difficulty').select('easy');
    cy.get('button').contains('Create Question').click();
    cy.get('.alert-success').should('contain', 'Question created successfully');
    cy.get('table').contains('Test question no answer');
  });
});