describe('getDiv', function() {
  var d = document.querySelector('#freq');
  it('Should exist', function() {
      expect(d.nodeName).toBe('DIV');
  });
});