#!/usr/bin/env node
const { program } = require('commander');
const { extractFiles } = require('../lib/io.js')

program
  .name('css-pipe-all')
  .description('A css-pipe tool')
  .version('1.0.12');

program.command('run')
  .description('begin run')
  .argument('<string>', 'A dirName or fileName')
  .requiredOption('-t, --type <type>', 'what do you want to tanslate file ?')
  .option('-opt, --settings [settings...]', 'specify settings')
  .option('--tab2', 'will be 2 tab')
  .option('--tab4', 'will be 4 tab')
  .option('--del-out', 'will delete outside comments')
  .option('--del-in', 'will delete in comments')
  .action((str, options) => {
    console.log('options', options);
    console.log(str)
    extractFiles(str, 'wxss', options.settings)
  });
// if(!program.addArgument) console.log('Error: Please write dirname !')
program.parse(process.argv)
