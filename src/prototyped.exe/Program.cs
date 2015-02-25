using prototyped.exe.forms;
using prototyped.exe.helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace prototyped.exe
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            var packageDir = AppConfig.GetPackageFolder();
            var autoStart = ProtoPackager.IsInstalled(packageDir);
#if DEBUG
            autoStart = false;
#endif
            if (autoStart)
            {
                ProtoPackager.Run(AppConfig.PackageStart, Environment.CurrentDirectory, string.Join(" ", args)).WaitForExit();
            }
            else
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MainForm
                {
                    Text = typeof(Program).Assembly.ManifestModule.Name
                });
            }
        }
    }
}
