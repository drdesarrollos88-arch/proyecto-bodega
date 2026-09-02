-- Políticas de acceso para permitir lectura y escritura desde la aplicación web
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a products" ON products;
CREATE POLICY "Permitir todo a products" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a cost_centers" ON cost_centers;
CREATE POLICY "Permitir todo a cost_centers" ON cost_centers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a profiles" ON profiles;
CREATE POLICY "Permitir todo a profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a requests" ON requests;
CREATE POLICY "Permitir todo a requests" ON requests FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a request_items" ON request_items;
CREATE POLICY "Permitir todo a request_items" ON request_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a deliveries" ON deliveries;
CREATE POLICY "Permitir todo a deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a purchase_orders" ON purchase_orders;
CREATE POLICY "Permitir todo a purchase_orders" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
