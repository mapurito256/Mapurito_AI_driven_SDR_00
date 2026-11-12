# Intake - FM spectrum-sensing sensor (seed case)

> Raw intake material for the Ctx 00 seed case. Each `- ` bullet is one
> statement; the engine numbers them STM-01.. deterministically (00.1).
> Nothing here is interpreted or summarized; classification happens in the
> record, not in this file.

- Hi team, hope the quarter is going well.
- In our city the FM broadcast band often carries transmissions that no one has authorized, and licensed stations complain of interference.
- We need to know, channel by channel, whether each FM broadcast channel is occupied and how that occupancy changes over the day.
- We also want to notice when a channel's occupancy departs from its usual pattern so an analyst can look into it.
- Success for us means we can see the state of every channel in the target band on each pass, and that unexpected changes surface quickly.
- The target band is the FM broadcast band from 88 to 108 MHz.
- The sensor must run unattended at a fixed site for days at a time.
- An RTL-SDR dongle and a Raspberry Pi are already available for the project.
- We had assumed a neural-network classifier running on the Pi would be the way to label each channel.
- The analyst on the spectrum operations desk will review the occupancy reports and anomaly flags.
- Broadcast station operators are affected because their interference complaints depend on what we report, though they never touch the system.
- The national spectrum regulator sets the rules for using the FM band and may want occupancy evidence.
- We do not want this system to demodulate or record the audio content of any station - only whether a channel is in use.
- Decoding RDS metadata is out of scope for now.
- The sensor only needs to cover one fixed site; a mobile or multi-site network is not part of this project.
- Expected result: a per-channel occupancy log and an anomaly flag stream the analyst can read each cycle.
