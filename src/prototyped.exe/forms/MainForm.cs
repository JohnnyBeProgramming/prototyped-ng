using prototyped.exe.helpers;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace prototyped.exe.forms
{
    public partial class MainForm : Form
    {
        protected string WorkingFolder { get { return AppConfig.GetPackageFolder(); } }
        protected Process WorkingProcess { get; set; }

        public MainForm()
        {
            InitializeComponent();

            Load += (s, e) => UpdateUI();
        }

        private void UpdateUI()
        {
            var isInstalled = ProtoPackager.IsInstalled(WorkingFolder);
            var isRunning = WorkingProcess != null && !WorkingProcess.HasExited;
            var prog = ProtoPackager.WorkerProgress;
            if (prog != null && prog.IsBusy)
            {
                pnlProgress.Visible = true;
                lblStatus.Text = prog.StatusText ?? "Busy...";
                progBar.Minimum = 0;
                progBar.Maximum = 100;
                progBar.Value = (int)(100 * prog.Progress / prog.Total);
            }
            else
            {
                pnlProgress.Visible = false;
                button1.Text = isInstalled ? "Uninstall" : "Install";
                button1.Enabled = !isRunning;
                button2.Text = isRunning ? "Close" : "Run";
                button2.Enabled = isInstalled;
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                var isInstalled = ProtoPackager.IsInstalled(WorkingFolder);
                if (isInstalled)
                {
                    var msg = "Are you sure you want to remove:\r\n" + WorkingFolder;
                    var res = MessageBox.Show(msg, "Uninstall", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Warning);
                    if (res == System.Windows.Forms.DialogResult.Yes)
                    {
                        ProtoPackager.Uninstall(WorkingFolder);
                    }
                }
                else
                {
                    var ctx = this;
                    var checker = new Thread(() =>
                    {
                        while (!ctx.IsDisposed)
                        {
                            Thread.Sleep(500);
                            ctx.Invoke((Action)UpdateUI);
                        }
                    });
                    var runner = new BackgroundWorker { };
                    runner.DoWork += (snd, evt) =>
                    {
                        try
                        {
                            checker.Start();

                            ProtoPackager.Unpack(WorkingFolder, AppConfig.PackagersDirs);
                        }
                        finally
                        {
                            checker.Abort();
                            Invoke((Action)UpdateUI);
                        }
                    };
                    runner.RunWorkerAsync();
                }
                UpdateUI();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }


        private void button2_Click(object sender, EventArgs e)
        {
            try
            {
                var isRunning = WorkingProcess != null && !WorkingProcess.HasExited;
                if (isRunning)
                {
                    WorkingProcess.Kill();
                    WorkingProcess = null;
                    UpdateUI();
                }
                else
                {
                    WorkingProcess = ProtoPackager.Run(AppConfig.PackageStart);

                    var ctx = this;
                    new Thread(() =>
                    {
                        WorkingProcess.WaitForExit();
                        ctx.Invoke((Action)ClearWorkerProcess);
                    }).Start();
                }
                UpdateUI();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        private void ClearWorkerProcess()
        {
            WorkingProcess = null;
            UpdateUI();
        }

    }
}
