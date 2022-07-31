const getColorInfoProgram = new GetColorInfoProgram({
  runBtnSel: '#getColorBtn',
  colorInputSel: '#colorInput',
  resultInputSel: '#result',
  copyBtnSel: '#copyBtn',
  errorSel: '#error',
  successSel: '#success',
  colorBlockSel: '#color-block',
  loadSel: '#load',
})

getColorInfoProgram.run();
