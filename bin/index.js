const { program } = require('commander');
const { log } = require("../lib/index");

program
  .name('css2saas')
  .description('A css2saas tool')
  .version('0.0.1');

program.command('run')
  .description('begin run')
  .argument('<string>', 'A dirName or fileName')
  .option('--tab2', 'will be 2 tab')
  .option('--tab4', 'will be 4 tab')
  .option('--del-out', 'will delete outside comments')
  .option('--del-in', 'will delete in comments')
  .action((str, options) => {
    console.log('options', options);
    log(str)
  });

program.parse(process.argv)
