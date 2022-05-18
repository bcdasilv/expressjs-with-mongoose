Feature: Searching users

    Scenario: Search with a valid name
        Given the user name to be searched is 'Ted Lasso'
        When the search request is sent
        Then the result should be a list of user objects with name 'Ted Lasso'