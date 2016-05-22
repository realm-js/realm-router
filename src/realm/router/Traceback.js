"use realm backend";

import lodash as _, swig, parsetrace, logger from realm.router.utils;

class Traceback {
   static handle(e, res, prettyTrace) {
      logger.fatal(e.stack || e);
      // If we have a direct error

      if (e.status) {
         return res.status(e.status).send(e);
      }

      if (prettyTrace) {
         if (e.stack) {
            var error = parsetrace(e, {
               sources: true
            }).object();

            return res.status(500).send(swig.renderFile(__dirname + '/traceback.html', {
               error: error
            }));
         }
      }
      return res.status(500).send({
         status: 500,
         message: "Server Error"
      });
   }
}

export Traceback;
