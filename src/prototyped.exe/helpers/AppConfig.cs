using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace prototyped.exe
{
    public static class AppConfig
    {
        public static string PackageFile = "package.json";
        public static string PackageStart = @"npm install & npm start";
        public static string PackagersDirs = ".npm";

        public static bool UseShadowFolder { get; private set; }

        static AppConfig()
        {
#if DEBUG
            //PackagersDirs = string.Empty;
            UseShadowFolder = false;
#endif
        }

        public static string GetPackageFolder(string name = null)
        {
            var relPath = PackagersDirs;
            var baseDir = UseShadowFolder
                                ? Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)
                                : Environment.CurrentDirectory;

            if (!string.IsNullOrEmpty(relPath)) baseDir = baseDir + @"\" + relPath;
            if (!string.IsNullOrEmpty(name)) baseDir = baseDir + @"\" + name;
            
            return baseDir;
        }
    }

}
