const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fijixfpsmoktksozsyjd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaml4ZnBzbW9rdGtzb3pzeWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDAwMTUsImV4cCI6MjA3NTc3NjAxNX0.XcHqCBxuSjnyJiR42B2rMgpvw7M2lb0w700DAWGb2zw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixReservationsCounts() {
  try {
    console.log('Fetching all scheduled instances...');
    const { data: instances, error: instancesError } = await supabase
      .from('course_instances')
      .select('id, max_capacity, current_reservations')
      .eq('status', 'scheduled');

    if (instancesError) throw instancesError;

    if (!instances || instances.length === 0) {
      console.log('No scheduled instances found');
      return;
    }

    console.log(`Found ${instances.length} scheduled instances\n`);

    let updatedCount = 0;
    let correctCount = 0;

    for (const instance of instances) {
      // Count confirmed reservations
      const { data: reservations, error: reservError, count } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('course_instance_id', instance.id)
        .eq('status', 'confirmed');

      if (reservError) {
        console.error(`Error counting reservations for instance ${instance.id}:`, reservError);
        continue;
      }

      const actualCount = count || 0;

      if (actualCount !== instance.current_reservations) {
        console.log(`Instance ${instance.id}:`);
        console.log(`  - Stored count: ${instance.current_reservations}`);
        console.log(`  - Actual count: ${actualCount}`);
        console.log(`  - Max capacity: ${instance.max_capacity}`);
        console.log(`  - Status: UPDATING ✓\n`);

        const { error: updateError } = await supabase
          .from('course_instances')
          .update({ current_reservations: actualCount })
          .eq('id', instance.id);

        if (updateError) {
          console.error(`Error updating instance ${instance.id}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        correctCount++;
      }
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`✓ Already correct: ${correctCount}`);
    console.log(`✓ Fixed: ${updatedCount}`);
    console.log(`✓ Total instances: ${instances.length}`);
    console.log('========== DONE ==========');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixReservationsCounts();
