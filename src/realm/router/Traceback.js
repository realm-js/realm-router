"use realm backend";

import lodash as _, swig, parsetrace, logger from realm.router.utils;
import chalk from realm.router.utils;
import fs from realm.utils;

let findRelatedModule = (frame) => {
   var lines = fs.readFileSync(frame.file).toString().split('\n');
   for (var i = frame.line; i > 0; i--) {
      var mod = lines[i].match(/realm\.module\("([^"']+)/)
      if (mod) {
         return mod[1];
      }
   }
}
class Traceback {
   static handle(e, res, prettyTrace) {

      if (e.stack) {
         var error = parsetrace(e, {
            sources: true
         }).object();
         if (error.frames[0]) {
            logger.fatal("Realm server error");
            var frame = error.frames[0];
            var moduleName = findRelatedModule(frame);

            var source = frame.source;
            var markup = [];
            _.each(source, function(item, number) {
               markup.push("\t\t" + number + "\t" + item.code)
            });
            console.log("\t" + chalk.bgRed.bold.white(error.error));

            if (moduleName) {
               console.log("\t" + chalk.yellow.bold(">> " + moduleName));
            }
            console.log(chalk.yellow(markup.join('\n')));
            console.log("\t" + chalk.green(frame.function) + "\t" + frame.file + ":" + frame.line + ":" + frame.column)
            for (var i = 1; i < error.frames.length; i++) {
               var fr = error.frames[i];
               console.log("\t" + chalk.green(fr.function) + "\t" + fr.file + ":" + fr.line + ":" + fr.column)
            }
         }

      } else {
         logger.fatal(e.stack || e);
      }

      if (e.status) {
         return res.status(e.status).send(e);
      }

      return res.status(500).send({
         status: 500,
         message: "Server Error"
      });
   }
}

export Traceback;
