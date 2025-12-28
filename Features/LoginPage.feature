Feature: Login to ActiveControl

  Scenario: Login with valid credentials
    Given the login panel is displayed
    When the user logs on with valid credentials "RPRAJAPATI" "Sangram@43"
    Then the Dashboard profile displays user initials "RP"