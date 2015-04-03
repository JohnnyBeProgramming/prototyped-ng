using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace prototyped.ng.extended
{
    public class Packager : prototyped.ng.Packager
    {
        public override Assembly TargetAssembly
        {
            get { return this.GetType().Assembly; }
        }

        public override void ProcessRequest(HttpContext context)
        {
            var req = context.Request;
            if (req.AcceptTypes.Contains("text/javascript"))
            {
                context.Response.Output.WriteLine("console.warn('Note: Your browser is loading extended javascript.');");
            }
            base.ProcessRequest(context);
        }
    }
}