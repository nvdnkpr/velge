describe 'Velge', ->
  velge      = null
  $container = null
  template   = '<div class="container"></div>'

  beforeEach ->
    $container = $(template).appendTo($('#sandbox'))

  afterEach ->
    $('#sandbox').empty()

  describe '#setup', ->
    it 'returns the instance for chaining', ->
      velge = new Velge($container)

      expect(velge.setup()).to.be(velge)

    it 'injects the velge structure into the container', ->
      velge = new Velge($container).setup()

      expect($container).to.have('.velge')
      expect($container).to.have('.velge-list')
      expect($container).to.have('.velge-input')
      expect($container).to.have('.velge-trigger')
      expect($container).to.have('.velge-dropdown')

    it 'renders all provided choices', ->
      velge = new Velge($container,
        chosen:  [{ name: 'apple' }, { name: 'melon' }]
        choices: [{ name: 'banana' }]
      ).setup()

      expect($('.velge-list', $container)).to.contain('apple')
      expect($('.velge-list', $container)).to.contain('melon')
      expect($('.velge-dropdown', $container)).to.contain('banana')

  describe '#addChoice', ->
    beforeEach ->
      velge = new Velge($container).setup()

    it 'preopulates the dropdown menu with supplied choices', ->
      velge.addChoice(name: 'banana')

      expect($('.velge-dropdown', $container)).to.contain('banana')

    it 'maintains choices in alphabetical order', ->
      velge
        .addChoice(name: 'watermelon')
        .addChoice(name: 'banana')
        .addChoice(name: 'kiwi')

      expect($('.velge-dropdown li', $container).eq(0).text()).to.contain('banana')
      expect($('.velge-dropdown li', $container).eq(1).text()).to.contain('kiwi')
      expect($('.velge-dropdown li', $container).eq(2).text()).to.contain('watermelon')

    it 'does not display duplicate choices', ->
      velge
        .addChoice(name: 'Fig')
        .addChoice(name: 'Fig')

      expect($('.velge-dropdown li', $container).length).to.eq(1)

    it 'does not display choices that have been chosen', ->
      velge
        .addChosen(name: 'Fig')
        .addChosen(name: 'Grape')
        .addChoice(name: 'Fig')
        .addChoice(name: 'Peach')

      expect($('.velge-dropdown', $container)).to.not.contain('Fig')

  describe '#addChosen', ->
    beforeEach ->
      velge = new Velge($container).setup()

    it 'populates the chosen list with supplied tags', ->
      velge.addChosen(name: 'apple')

      expect($('.velge-list', $container)).to.contain('apple')

  describe '#remChoice', ->
    beforeEach ->
      velge = new Velge($container, choices: [{ name: 'apple' }]).setup()

    it 'removes the choice', ->
      velge.remChoice(name: 'apple')

      expect($('.velge-dropdown', $container)).to.not.contain('apple')

  describe '#remChosen', ->
    beforeEach ->
      velge = new Velge($container, chosen: [{ name: 'apple' }]).setup()

    it 'removes the chosen status, returning it to the list of choices', ->
      velge.remChosen(name: 'apple')

      expect($('.velge-list', $container)).to.not.contain('apple')
      expect($('.velge-dropdown', $container)).to.contain('apple')
