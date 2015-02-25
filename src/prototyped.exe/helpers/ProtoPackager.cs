using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace prototyped.exe.helpers
{
    public class ProtoPackager
    {
        public static ProgressTracker WorkerProgress { get; private set; }
        public class ProgressTracker
        {
            public bool IsBusy { get; set; }
            public float Progress { get; set; }
            public float Total { get; set; }
            public string StatusText { get; set; }
        }

        public static void Unpack(string workingFolder, string resourcePath)
        {
            // Ensure base folder exists
            var baseFolder = AppConfig.GetPackageFolder();
            if (!Directory.Exists(baseFolder)) Directory.CreateDirectory(baseFolder).Attributes |= FileAttributes.Hidden;

            // Create working folder (if not exists)
            if (!Directory.Exists(workingFolder)) Directory.CreateDirectory(workingFolder).Attributes |= FileAttributes.Hidden;

            // Extract resources
            ExtractEmbeddedResources(typeof(ProtoPackager).Assembly, resourcePath, workingFolder);
        }

        private static void ExtractEmbeddedResources(Assembly assembly, string resourceLocation, string outputDir)
        {
            // Initialise a progress indicator
            WorkerProgress = new ProgressTracker
            {
                IsBusy = true,
                Total = 1.0f,
                Progress = 0.0f,
                StatusText = "Initialising..."
            };

            var list = new List<string> { };
            try
            {
                WorkerProgress.StatusText = "Extracting resources...";

                var prefix = assembly.ManifestModule.Name + "." + resourceLocation;
                foreach (string resourceName in assembly.GetManifestResourceNames())
                {
                    var res = assembly.GetManifestResourceInfo(resourceName);
                    if (resourceName.StartsWith(prefix))
                    {
                        var ident = resourceName.Substring(prefix.Length + 1);
                        var ext = Path.GetExtension(ident);
                        var val = ident.Substring(0, ident.Length - ext.Length);
                        var pos = val.IndexOf(".");
                        var cwd = outputDir + Path.DirectorySeparatorChar;
                        while (pos > 0)
                        {
                            var dir = val.Substring(0, pos);
                            if (!Directory.Exists(dir)) Directory.CreateDirectory(Path.Combine(cwd, dir));
                            val = val.Substring(pos + 1);
                            cwd = Path.Combine(cwd, dir);
                            pos = val.IndexOf(".");
                        }
                        list.Add(Path.Combine(cwd.Substring(outputDir.Length + 1), val + ext));
                    }
                }
            }
            catch (Exception ex)
            {
                WorkerProgress.StatusText = "Error: " + ex.Message;
                return;
            }

            // Setup step counters
            long stepIndex = 0;
            long stepTotal = list.Count;
            foreach (var file in list)
            {
                // Changes status message (to user)
                WorkerProgress.StatusText = "Extracting: " + file;

                // Define progress parts
                var progSize = 1 / (float)stepTotal;
                var progDone = stepIndex * progSize;
                var prefix = assembly.ManifestModule.Name + "." + resourceLocation;
                var resFile = prefix + "." + file.Replace("\\", ".");
                using (var stream = assembly.GetManifestResourceStream(resFile))
                {
                    var fileSize = stream.Length;
                    var filePath = Path.Combine(outputDir, file);
                    var cpath = Path.GetDirectoryName(filePath);
                    if (!Directory.Exists(cpath))
                    {
                        Directory.CreateDirectory(cpath).Attributes |= FileAttributes.Hidden;
                    }
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        for (var i = 0; i < stream.Length; i++)
                        {
                            fileStream.WriteByte((byte)stream.ReadByte());
                            WorkerProgress.Progress = progDone + progSize * i / fileSize;
                        }
                        fileStream.Close();
                    }
                }
                stepIndex++;
            }
            WorkerProgress.StatusText = "Done";
            WorkerProgress.IsBusy = false;
        }

        public static Process Run(string filename, string workingDir = null, string args = null)
        {
            if (workingDir == null)
            {
                workingDir = AppConfig.GetPackageFolder();
            }

            // Define what to run
            var info = new ProcessStartInfo
            {
                FileName = "CMD.exe",
                Arguments = " /C " + filename + " " + args,
                WorkingDirectory = workingDir,
                UseShellExecute = false,
            };

            // Define the process that will run it
            var proc = new Process
            {
                StartInfo = info,
            };

            // Start the process!
            var success = proc.Start();
            if (success)
            {
                // Program was Run successfully
            }
            return proc;
        }

        public static bool IsInstalled(string WorkingFolder)
        {
            var isInstalled = Directory.Exists(WorkingFolder);
            return isInstalled;
        }

        public static void Uninstall(string workingFolder)
        {
            // Clear and delete working folder
            if (Directory.Exists(workingFolder)) Directory.Delete(workingFolder, true);

            var baseFolder = AppConfig.GetPackageFolder();
            if (baseFolder != workingFolder && !Directory.GetDirectories(baseFolder).Any())
            {
                // Clear the working folder (if nothing in it)
                if (!Directory.GetFiles(baseFolder).Any()) Directory.Delete(baseFolder);
            }
        }
    }
}
