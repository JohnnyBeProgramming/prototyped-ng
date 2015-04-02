using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace prototyped.ng
{
    public class Packager : IHttpHandler
    {
        public virtual Assembly TargetAssembly
        {
            get { return this.GetType().Assembly; }
        }

        public void ProcessRequest(HttpContext context)
        {
            var resp = context.Response;
            var req = context.Request;
            if (req.RequestType == "GET")
            {
                var path = req.MapPath(req.Path);
                var contents = !File.Exists(path)
                    ? GetEmbededResource(TargetAssembly, req.Path)
                    : GetFileResource(path);
                if (contents != null)
                {
                    resp.Clear();
                    resp.Output.Write(contents);
                }
                else
                {
                    resp.StatusCode = 404;
                    resp.SuppressContent = true;
                }
            }
        }

        private string GetEmbededResource(Assembly assembly, string path)
        {
            var prefix = assembly.ManifestModule.Name.Substring(0, assembly.ManifestModule.Name.Length - Path.GetExtension(assembly.ManifestModule.Name).Length);
            var resFile = prefix + path.Replace("\\", ".").Replace("/", ".");
            using (var stream = assembly.GetManifestResourceStream(resFile))
            {
                if (stream == null) return null;
                using (var reader = new StreamReader(stream, Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        private string GetFileResource(string path)
        {
            using (var stream = new FileStream(path, FileMode.Open))
            {
                if (stream == null) return null;
                using (var reader = new StreamReader(stream, Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        public bool IsReusable
        {
            get
            {
#if DEBUG
                return false;
#endif
                return true;
            }
        }
    }
}