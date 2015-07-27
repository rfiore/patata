'use strict';

var app = (function(document, $) {
	var modalTimer;
	var reloadTimer;
	var isModalOpen = false;
	var docElem = document.documentElement,
		_userAgentInit = function() {
			docElem.setAttribute('data-useragent', navigator.userAgent);
		},

		_init = function() {

			// uncommen to run modal timer
			/*$(document).on("click", function () {
				_stopModalTimer();
			});*/

			_initSections();
			_userAgentInit();
		},

		_initSections = function() {

			// INIT FOUNDATION
			$(document).foundation();

			// INIT AJAX
			$("a.ajax").on("click", function (e) {
					e.preventDefault();
					var path = $(this).attr("href");

					_loadPage(path);
			});

			// INIT SECTION
			if( $('#main').hasClass('home') ){
				_initHome();
			} else if( $('#main').hasClass('book') ) {
				_initBook();
			} else if( $('#main').hasClass('game') ) {
				_initGame();
			}

			// INIT LANG
			_initLang();

			$('#reloadModal').on('closed', function() {
				_closeModalTimer();
			});

			_userAgentInit();
		},

		_loadPage = function(path) {
			$( "#main" ).fadeOut('slow', function(){
					$('body').load( path + " #main", function() {
						$( "#main" ).hide().fadeIn('slow');
						Holder.run();
						_initSections();
				});
			})
		},

		// HOME ---------------------------------------------------------------------------------------------------------------------

		_initHome = function() {
			_clearModalTimer();

			// RESET LOCAL STORAGE VARS
			sessionStorage.currentQuiz = 1;
		},

		// BOOK ---------------------------------------------------------------------------------------------------------------------

		_initBook = function() {
			// uncomment to run modal timer
			_stopModalTimer();

			$('.nav-breadcrumb').html('<p data-i18n="book.pages.page_0.info"></p>').i18n();

			var langArr = i18n.lng().split('-');

			// Load pages
			var pagesTree = i18n.t('book.pages', { returnObjectTrees: true });
			var page_list = '';

			for(var page in pagesTree){
				page_list += '<div class="bb-item">';
				page_list += '<img src="images/book/' +  langArr[0] + "/" + pagesTree[page].src +'"/>';
				page_list += '</div>';
				$( '#bb-bookblock' ).html(page_list);
			}

			$( '#bb-bookblock' ).bookblock( {
						speed : 800,
						shadows		: true,
						shadowSides : 0.8,
						shadowFlip : 0.7,
						nextEl		: '#next-btn',
						prevEl		: '#prev-btn',
						onEndFlip	: function( old, page, isLimit ) {
							//console.log('on end = page ' + page);
							$('.nav-breadcrumb').html('<p data-i18n="book.pages.page_' + page +'.info"></p>').i18n();
							return false;
						}
					} );

			// onBeforeFlip: function( page ) { console.log('on before = page ' + page); return false; }

			$( '.to-page' ).on("click", function (e) {
				var pagetogo = parseInt($(this).attr('data-page'));
				$( '#bb-bookblock' ).bookblock( 'jump', pagetogo );
			} );

			// $( '#bb-bookblock' ).on("click", function (e) {
			// 	var x = e.pageX - $(this).offset().left;
			//
			// 	if(x < $(this).width()/2){
			// 		$(this).bookblock( 'prev' );
			// 	} else {
			// 		$(this).bookblock( 'next' );
			// 	}
			// 	/*var pagetogo = parseInt($(this).attr('data-page'));
			// 	$( '#bb-bookblock' ).bookblock( 'jump', pagetogo );*/
			// } );

			$('#bb-bookblock').on('swipeleft', function() {
				$(this).bookblock( 'next' );
			});
			$('#bb-bookblock').on('swiperight', function() {
				$(this).bookblock( 'prev' );
			});			
		},

		// GAME ---------------------------------------------------------------------------------------------------------------------

		_initGame = function() {
			// uncomment to run modal timer
			_stopModalTimer();


			var tooltip = $('#tool-tip');
			tooltip.on('click', function() {
				console.log("WIN!");
				$('#main.game').addClass('hidden');
				openModal(sessionStorage.currentQuiz);
			});

			var totalQuestions = 0;
			var correctQuestions = 0;

			sessionStorage.currentQuiz = 0;
			openModal(sessionStorage.currentQuiz);


			function loadGame(level){

				totalQuestions = 0;
				correctQuestions = 0;

				// Main title
				$('#main.game > .title > div').html('<h1 data-i18n="game.quiz.quiz_' + level + '.title"></h1>');

				// TO DO: Load question title

				// Questions
				var target = i18n.t('game.quiz.quiz_' + level + '.questions', { returnObjectTrees: true });
				var questions_list = '<ul>';
				var i = 1;

				for(var question in target){
					questions_list += '<li id="question_' + i +'"><h3 data-i18n="[html]game.quiz.quiz_' + level + '.questions.question_' + i + '"></h3></li>';
					i++;
				}
				questions_list += '</ul>';

				$('#main.game > .questions > div .questions_list').html(questions_list);

				$('#main.game').i18n();

				$('#main.game').removeClass('hidden');
				initQuiz(level);
			}


			function openModal(curQuiz){
				$('#gameModal .title').html('');
				$('#gameModal .subtitle').html('');
				$('#gameModal .content').html('');

				$('#gameModal').foundation('reveal', 'open');

				var modal_bg_path;
				var langArr = i18n.lng().split('-');

				if(parseInt(curQuiz) === 0){

					modal_bg_path = 'images/modal/modal_0-' + langArr[0] + '.jpg';

				} else {
					$('#gameModal .title').append('<h1 data-i18n="game.quiz.quiz_' + curQuiz + '.modal_title"></h1>');
					$('#gameModal .subtitle').append('<h2>- INFO BOX -</h2>');
					$('#gameModal .content').append('<p data-i18n="[html]game.quiz.quiz_' + curQuiz + '.modal_content"></p>');

					modal_bg_path = 'images/modal/modal_' + curQuiz + '.jpg';
				}

				$('#gameModal .container').css({'background-image': 'url('+ modal_bg_path +')'});

				$('#gameModal').i18n();
			}


			$('#gameModal').on('closed', function() {
				if(sessionStorage.currentQuiz < 6){
					console.log('clear');
					clearQuiz();
					sessionStorage.currentQuiz++;
					loadGame(parseInt(sessionStorage.currentQuiz));
				} else {
					console.log('end');
					var langArr = i18n.lng().split('-');
					var modal_bg_path = 'images/modal/modal_7-' + langArr[0] + '.jpg';
					$('#endModal .container').css({'background-image': 'url('+ modal_bg_path +')'});
					$('#endModal').foundation('reveal', 'open');
				}
			});

			$('#endModal').on('closed', function() {
				_loadPage('index.html');
			});

			function initQuiz(quiz){

				// Navigation bookmark
				//setTimeout(function(){
					$( '.navigation ul li:nth-child('+ (parseInt(quiz)+1) +')' ).addClass('animated bounceIn active');
				//}, 500);

				var langArr = i18n.lng().split('-');
				//console.log('i18n.lng = ' + i18n.lng() + ' / ' + 'langArr[0] = ' + langArr[0]);

				// Load quiz backgrounds
				var bg_sx_path = 'images/quiz/bg/' + langArr[0] + '/bg_' + quiz + '_sx.png';
				var bg_dx_path = 'images/quiz/bg/' + langArr[0] + '/bg_' + quiz + '_dx.png';

				$('#drop-container').css({'background-image': 'url('+ bg_dx_path +')'});
				$('#drag-container').css({'background-image': 'url('+ bg_sx_path +')'});
				$('#quiz-container').addClass('row quiz quiz_' + quiz);

				var curQuiz = quizList['quiz_' + quiz];
				var inc = 0;

				for (var curQuestion in curQuiz){

					// Get positions
					var figureX = curQuiz['question_' + (inc+1)].figure_x;
					var figureY = curQuiz['question_' + (inc+1)].figure_y;

					var slotX = curQuiz['question_' + (inc+1)].slot_x;
					var slotY = curQuiz['question_' + (inc+1)].slot_y;


					// Create draggable objects
					$('<div></div>')
					.data( 'number', inc ).attr( 'id', 'figure'+inc )
					.css({'top': figureY+'px', 'left': figureX+'px'})
					.html('<img src="images/quiz/figures/figure_' + quiz + '-' + (inc+1) + '.png" />')
					.appendTo( '#drag-container' )
					.draggable( {
						containment: '#quiz-container',
						stack: '#drag-container div',
						cursor: 'move',
						revert: true,
						start: function( event, ui ) {
							tooltip.removeClass('visible');
						}
					} );

					// Create droppable objects
					$('<div></div>')
					.data( 'number', inc )
					.attr( 'id', 'slot'+inc )
					.css({'top': slotY+'px', 'left': slotX+'px'})
					.html('<img draggable="false" src="images/quiz/slots/slot_' + quiz + '-' + (inc+1) + '.png" />')
					.appendTo( '#drop-container' ).droppable( {
						accept: '#drag-container div',
						hoverClass: 'hovered',
						drop: handleFigureDrop
					} );

					inc++;
				}

				totalQuestions = inc;
			}

			function clearQuiz(){

				$('#main.game > .questions > div .questions_list').html('');
				$('#main.game > .title > div').html('');
				$('#drop-container').html('');
				$('#drag-container').html('');
				tooltip.removeClass('visible');
				$( '.navigation ul li' ).each(function( index ) {
				  $(this).removeClass();
				});
				$('#quiz-container').removeClass();

			}

			// Handle drop
			function handleFigureDrop( event, ui ){


				var slotId = $(this).data( 'number' );
				var figureId = ui.draggable.data( 'number' );

				if ( slotId == figureId /*&& $(this).hasClass('current')*/ ) {
					ui.draggable.addClass( 'correct' );
					ui.draggable.draggable( 'disable' );
					$(this).droppable( 'disable' );
					//ui.draggable.removeClass('animated bounceIn')
					ui.draggable.position( { of: $(this), my: 'left top', at: 'left top' } );
					ui.draggable.draggable( 'option', 'revert', false );


					// Show tooltip

					var halfContainer = $('#drop-container').width()/2;
					var dragPos = ui.draggable.offset().left - $('#drop-container').offset().left;

					tooltip.removeClass();

					if(dragPos < halfContainer){
						tooltip.attr({'data-i18n': 'game.quiz.quiz_' + sessionStorage.currentQuiz + '.texts.text_' + (slotId+1)})
						.css({
							'top': ui.draggable.position().top  + (ui.draggable.height()/2) - ($(this).height()/2),
							'left': ui.draggable.position().left + ui.draggable.width(),
						})
						.addClass('visible opendx');
					} else {
						tooltip.attr({'data-i18n': 'game.quiz.quiz_' + sessionStorage.currentQuiz + '.texts.text_' + (slotId+1)})
						.css({
							'top': ui.draggable.position().top  + (ui.draggable.height()/2) - ($(this).height()/2),
							'left': ui.draggable.position().left - 350,
						})
						.addClass('visible opensx');
					}
					tooltip.i18n();

					correctQuestions++;
				}


				if(correctQuestions === totalQuestions){
					// If game end
					tooltip.append('<p><a class="button round small expand">Continua</a></p>');
				}
			}
		},

		// MODAL ---------------------------------------------------------------------------------------------------------------------

		_runModalTimer = function() {
			console.log('Run timer');

			modalTimer = setTimeout(function(){
					$('#reloadModal').foundation('reveal', 'open');
					isModalOpen = true;
					_stopModalTimer();
					_runReloadTimer();
					console.log('Open modal');
			}, 180000);
		},

		_stopModalTimer = function() {
			console.log('Reset timer');
			clearTimeout(modalTimer);
			if(!isModalOpen){
				_runModalTimer();
			}
		},

		_clearModalTimer = function() {
			console.log('Clear timer');
			clearTimeout(modalTimer);
		},

		_closeModalTimer = function() {
			console.log('Close modal');
			_runModalTimer();
			clearTimeout(reloadTimer);
			isModalOpen = false;
		},

		_runReloadTimer = function() {
			console.log('Run timer');
			reloadTimer = setTimeout(function(){
				window.location.reload();
			}, 30000);
		},

		// LANG ---------------------------------------------------------------------------------------------------------------------

		_initLang = function() {
			$( '.lang-switch' ).on( 'click ', function(e) {
				e.preventDefault();
				_switchLang();
			} );

			i18n.init({ useCookie: true }, function() {
					$('.menu').i18n();
					$('.lang-switch').i18n();
					$('.big-btn').i18n();
					$('#main.game').i18n();
					$('#main.home').i18n();
			});

			console.log('Current lang is: ' + i18n.lng());
		},

		_switchLang = function() {
			var curLang = i18n.lng();

			if(curLang === 'it' || curLang === 'it-IT'){
				i18n.setLng('en');
			} else if(curLang === 'en' || curLang === 'en-US'){
				i18n.setLng('it');
			}

			console.log('Now lang is: ' + i18n.lng());
			window.location.reload()
		};
	return {
		init: _init
	};
})(document, jQuery);

(function() {
	app.init();
})();
