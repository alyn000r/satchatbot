angular.module("satFlashCardsApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    flashcards: function(Flashcards) {
                        return Flashcards.getFlashCards();
                    }
                }
            })
            .when("/new/flashcard", {
                controller: "NewFlashCardController",
                templateUrl: "create-flashcard-form.html"
            })
            .when("/flashcard/:flashCardId", {
                controller: "EditFlashCardController",
                templateUrl: "edit-flash-card.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Flashcards", function($http) {
        this.getFlashCards = function() {
            return $http.get("/satflashcard").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding flash cards.");
                });
        }
        this.createFlashCards = function(flashcard) {
            return $http.post("/satflashcard", flashcard).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating flash card.");
                });
        }
        this.getFlashCard = function(flashCardId) {
            var url = "/satflashcard/" + flashCardId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this contact.");
                });
        }
        this.editFlashCard = function(flashCard) {
            var url = "/satflashcard/" + flashCard._id;
            console.log(flashCard._id);
            return $http.put(url, flashCard).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this flashCard.");
                    console.log(response);
                });
        }
        this.deleteFlashCard = function(flashCardId) {
            var url = "/satflashcard/" + flashCardId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this flash card.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(flashcards, $scope, Flashcards, $route) {
        $scope.flashcards = flashcards.data;

        $scope.deleteFlashCard = function(flashCardId) {
            Flashcards.deleteFlashCard(flashCardId).then(function(data){
                $route.reload();
            });
        }
    })
    .controller("NewFlashCardController", function($scope, $location, Flashcards, $route) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveFlashCard = function(flashCard) {
            Flashcards.createFlashCards(flashCard).then(function(doc) {
                $location.path("#/");
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditFlashCardController", function($scope, $routeParams, Flashcards) {
        Flashcards.getFlashCard($routeParams.flashCardId).then(function(doc) {
            $scope.flashcard = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.flashCardFormUrl = "edit-flash-card.html";
        }

        $scope.saveFlashCard = function(flashCard) {
            Flashcards.editFlashCard(flashCard);
            $scope.editMode = false;
            $scope.flashCardFormUrl = "";
        }
    });