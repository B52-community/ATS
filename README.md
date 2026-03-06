# ATS

Utility scripts and experiments.

## Android ISO simulator

Use `run_android_sim.py` to launch an Android-x86 ISO with QEMU.

### Requirements
- `qemu-system-x86_64`
- `qemu-img`

### Quick start
```bash
python3 run_android_sim.py --iso /path/to/android-x86_64.iso
```

### Useful options
```bash
python3 run_android_sim.py \
  --iso /path/to/android.iso \
  --disk ./android_vm.qcow2 \
  --ram 4096 \
  --cpus 4 \
  --disk-size 32
```

Use `--dry-run` to preview commands and `--no-kvm` if KVM is unavailable.
