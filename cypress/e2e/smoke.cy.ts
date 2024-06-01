describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  // it("should allow you to register and login", () => {
  //   const loginForm = {
  //     email: `${faker.internet.userName()}@example.com`,
  //     password: faker.internet.password(),
  //   };

  //   cy.then(() => ({ email: loginForm.email })).as("user");

  //   cy.visitAndCheck("/");

  //   cy.findByRole("link", { name: /sign up/i }).click();

  //   cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
  //   cy.findByLabelText(/password/i).type(loginForm.password);
  //   cy.findByRole("button", { name: /create account/i }).click();

  //   cy.findByRole("link", { name: /notes/i }).click();
  //   cy.findByRole("button", { name: /logout/i }).click();
  //   cy.findByRole("link", { name: /log in/i });
  // });

  it("should allow you to make a reservation", () => {
    cy.login();
    cy.visit({
      url: "/reservations/new",
      qs: {
        day: "2024-04-24",
      },
    });
    cy.findByRole("combobox", { name: /What time are you starting?/i }).select(
      "8:00 am",
    );
    cy.findByRole("button", { name: /Reserve/i }).click();
  });
});
