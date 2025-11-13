const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fijixfpsmoktksozsyjd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaml4ZnBzbW9rdGtzb3pzeWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDAwMTUsImV4cCI6MjA3NTc3NjAxNX0.XcHqCBxuSjnyJiR42B2rMgpvw7M2lb0w700DAWGb2zw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    // Check instances
    const { data: allInstances, error: instancesError } = await supabase
      .from('course_instances')
      .select('id, status, max_capacity, current_reservations, instance_date');

    if (instancesError) throw instancesError;

    const instanceCount = allInstances ? allInstances.length : 0;
    console.log(`Total instances in database: ${instanceCount}\n`);

    if (allInstances && allInstances.length > 0) {
      const byStatus = {};
      allInstances.forEach(inst => {
        byStatus[inst.status] = (byStatus[inst.status] || 0) + 1;
      });

      console.log('Instances by status:');
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });

      // Show first 5 instances
      console.log('\nFirst 5 instances:');
      allInstances.slice(0, 5).forEach(inst => {
        console.log(`  Instance: ${inst.id}`);
        console.log(`    Date: ${inst.instance_date}, Status: ${inst.status}`);
        console.log(`    Capacity: ${inst.max_capacity}, Reservations: ${inst.current_reservations}`);
      });
    }

    // Check reservations
    const { data: allReservations, error: reservError, count: reservCount } = await supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true });

    if (reservError) throw reservError;

    console.log(`\nTotal reservations in database: ${reservCount}\n`);

    // Check if there are any confirmed reservations
    const { data: confirmedRes, error: confirmError, count: confirmCount } = await supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    if (confirmError) throw confirmError;
    console.log(`Confirmed reservations: ${confirmCount}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
