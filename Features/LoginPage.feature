Feature: Login to ActiveControl

  Scenario: Login with valid credentials
    Given the login panel is displayed
    When the user logs on with valid credentials "ADMINRAHUL" "@admin"
    Then the Dashboard profile displays user initials "A"

  Scenario: Login with invalid username
    Given the login panel is displayed
    When the user logs on with invalid username "invalid" "invalidpass"
    Then Alert displays message "Could not authenticate. Please log in again."

  Scenario: Login with invalid password
    Given the login panel is displayed
    When the user logs on with invalid password "auto-sapall" "invalid"
    Then Alert displays message "Could not authenticate. Please log in again."