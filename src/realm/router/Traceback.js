"use realm backend";

import lodash as _, swig, parsetrace, logger from realm.router.utils;
import chalk from realm.router.utils;

class Traceback {
   static handle(e, res, prettyTrace) {

      if (e.stack) {
         var error = parsetrace(e, {
            sources: true
         }).object();
         if (error.frames[0]) {
            logger.fatal("Realm server error");
            var frame = error.frames[0];
            var source = frame.source;
            var markup = [];
            _.each(source, function(item, number) {
               markup.push("\t\t" + number + "\t" + item.code)
            });
            console.log("\t" + chalk.bgRed.bold.white(error.error));
            console.log("\t" + chalk.green(frame.function) + "\t" + frame.file + ":" + frame.line + ":" + frame.column)
            console.log(chalk.yellow(markup.join('\n')));
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
